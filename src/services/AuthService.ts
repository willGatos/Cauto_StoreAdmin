import type {
    ForgotPassword,
    ResetPassword,
    SignUpCredential,
    User,
} from '@/@types/auth'
import appConfig from '@/configs/app.config'
import { OWNER, SELLER } from '@/constants/roles.constant'
import ApiService from './ApiService'
import supabase from './Supabase/BaseClient'

export async function apiSignIn(email: string, password: string) {
    // 1. Autenticar al usuario con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(`Error al iniciar sesión: ${error.message}`)
    }

    const { user } = data
    if (!user) {
        return null
    }

    // 2. Obtener los roles del usuario desde la tabla 'user_roles'
    const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(
            `
          roles (
            name
          )
        `
        )
        .eq('user_id', user.id)

    if (rolesError) {
        throw new Error(
            `Error al obtener los roles del usuario: ${rolesError.message}`
        )
    }

    // Extraer los nombres de los roles
    const roles = rolesData.map((role: any) => role.roles.name)

    console.log(roles)

    let shopId: string | null = null

    // 3. Si el usuario es dueño (owner), buscar shop_id
    if (roles.includes(OWNER)) {
        const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (shopError) {
            throw new Error(
                `Error al obtener la información de la tienda: ${shopError.message}`
            )
        }

        shopId = shopData?.id || null
    }

    // 4. Si el usuario es vendedor, establecer la relación en la tabla 'shop_vendors'
    if (roles.includes(SELLER)) {
        if (!shopId) {
            // Asume que el `shopId` ya ha sido asignado de alguna manera
            // Aquí podrías buscar el `shopId` correspondiente para el vendedor si es necesario
            const { data: vendorShopData, error: vendorShopError } =
                await supabase
                    .from('shop_vendors')
                    .select('shop_id')
                    .eq('vendor_id', user.id)
                    .single()

            if (vendorShopError || !vendorShopData) {
                throw new Error(
                    `Error al obtener la tienda del vendedor: ${vendorShopError?.message}`
                )
            }

            shopId = vendorShopData.shop_id
        }

        // Insertar la relación en la tabla 'shop_vendors'
        const { error: vendorInsertError } = await supabase
            .from('shop_vendors')
            .insert({
                shop_id: shopId,
                vendor_id: user.id,
            })

        if (vendorInsertError) {
            throw new Error(
                `Error al crear la relación de vendedor en la tienda: ${vendorInsertError.message}`
            )
        }
    }

    // 5. Devolver el objeto User que incluye los roles y el shop_id si es relevante
    const userWithRoles: User = {
        id: user.id,
        name: user.user_metadata.name || '',
        email: user.email || '',
        phone: user.user_metadata.phone || '',
        roles,
        shopId,
    }

    return { ...data, user: userWithRoles }
}
// export async function signIn(data: SignInCredential) {
//     const {email, password} = data;
//     return await supabase.auth.signInWithPassword({ email, password })
//     /*
//     return ApiService.fetchData<SignInResponse>({
//         url: 'users/sign-in',
//         method: 'post',
//         data,
//     })
//     */
// }

export async function apiSignUp(id: string, data: SignUpCredential) {
    return supabase.auth.signUp({
        ...data,
        options: { emailRedirectTo: appConfig.authenticatedEntryPath },
    })
    // return ApiService.fetchData<SignUpResponse>({
    //     url: `/subscription-links/${id}/user`,
    //     method: 'put',
    //     data,
    // })
}

// export async function apiSignInSeller(id:string, data: SignInCredential) {
//     return ApiService.fetchData<SignInResponse>({
//         url: `subscription-links/sign-in/${id}/seller`,
//         method: 'put',
//         data,
//     })
// }

export const signUpWithInvitation = async (
    invitationId: number,
    values,
    role
) => {
    const { email, password, name, phone } = values

    try {
        // 1. Validar la invitación y verificar si hay alguna invitación ya asignada
        const { data: invitation, error: invitationError } = await supabase
            .from('invitations')
            .select('id, shop_id, inviter_id, invitee_id')
            .eq('id', invitationId)
            .single()
        console.log(invitation)
        if (invitationError) {
            throw new Error(
                `Error al validar la invitación: ${invitationError.message}`
            )
        }

        if (!invitation) {
            throw new Error(`Invitación no válida.`)
        }

        const shopId = invitation.shop_id

        // 2. Crear el nuevo usuario
        const { data: authData, error: authError } = await supabase.auth.signUp(
            {
                email,
                phone,
                password,
                options: {
                    data: {
                        name,
                        phone,
                        email,
                    },
                },
            }
        )

        if (authError) {
            throw new Error(`Error: ${authError.message}`)
        }
        await assignRoleToUser(authData.user?.id, role)

        const { user } = authData

        if (!user) {
            throw new Error('No se pudo crear el usuario.')
        }

        // 3. Crear una nueva invitación si la actual se ha utilizado (invitee_id no es null)
        if (invitation.invitee_id !== null) {
            const { error: createInvitationError } = await supabase
                .from('invitations')
                .insert({
                    shop_id: shopId,
                    inviter_id: invitation.inviter_id,
                    invitee_id: user.id,
                })

            if (createInvitationError) {
                throw new Error(
                    `Error al crear una nueva invitación: ${createInvitationError.message}`
                )
            }
        } else {
            // 4. Actualizar la invitación actual con el invitee_id
            const { error: updateInvitationError } = await supabase
                .from('invitations')
                .update({ invitee_id: user.id })
                .eq('id', invitationId)

            if (updateInvitationError) {
                throw new Error(
                    `Error al actualizar la invitación: ${updateInvitationError.message}`
                )
            }
        }
        // TODO: Quedaria que el vendedor pueda ver todas las tiendas que tiene asociadas.
        if (role == SELLER) {
            // 5. Crear la relación en shop_vendors
            const { error: vendorError } = await supabase
                .from('shop_vendors')
                .insert({
                    shop_id: shopId,
                    vendor_id: user.id,
                })

            if (vendorError) {
                throw new Error(
                    `Error al crear la relación en shop_vendors: ${vendorError.message}`
                )
            }
        }

        return authData
    } catch (error) {
        return {
            status: 'failed',
            message:
                error.message ||
                'Error al completar el registro con la invitación.',
        }
    }
}

export async function apiSignUpSeller(id: string, data: SignUpCredential) {
    return ApiService.fetchData<User>({
        url: `/subscription-links/sign-up/${id}/seller`,
        method: 'put',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}

export async function assignRoleToUser(
    userId: string | undefined,
    roleName: string
) {
    try {
        // 1. Obtener el ID del rol según el nombre
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleName)
            .single()

        if (roleError) {
            throw new Error(`Error al obtener el rol: ${roleError.message}`)
        }

        const roleId = roleData?.id
        if (!roleId) {
            throw new Error('Rol no encontrado.')
        }

        // 2. Insertar la relación en la tabla user_roles
        const { error: userRoleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: roleId,
            })

        if (userRoleError) {
            throw new Error(
                `Error al asignar rol al usuario: ${userRoleError.message}`
            )
        }

        return {
            status: 'success',
            message: 'Rol asignado correctamente al usuario.',
        }
    } catch (error) {
        return {
            status: 'failed',
            message: error.message || 'Error al asignar el rol al usuario.',
        }
    }
}

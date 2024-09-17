export function convertForSelecters(obj) {
    // Obtenemos el valor de 'name' en minúsculas para 'value'
    const value = obj.name.toLowerCase();
    // Obtenemos el valor original de 'name' para 'label'
    const label = obj.name;
    
    // Creamos un nuevo objeto con las nuevas propiedades
    const transformedObj = {
        name: value,
        value: value,
        label: label,
       // options: value,
        ...obj
    };
    
    return transformedObj;
}

import { StoreData } from "./Welcome"

export type CallbackSetSkip = {
    storeData?: StoreData
    setStoreData?: Function
    onNext: () => void
    onSkip: () => void
}

export type CallbackSetBack = {
    storeData?: StoreData
    setStoreData?: Function
    onNext: () => void
    onBack: () => void
}

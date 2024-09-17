import React from 'react'

function CheckboxButton({textMe, name}) {
  return (
    
        <div className="flex">
            <input name={name} value={textMe} type="checkbox" id="choose-me" className="peer hidden" />
           
            <label for="choose-me" 
            className="select-none cursor-pointer rounded-lg border-2 border-gray-200
            py-1 px-2 font-bold text-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200 "> 
            {textMe} 
            </label>
        </div>
  )
}

export default CheckboxButton
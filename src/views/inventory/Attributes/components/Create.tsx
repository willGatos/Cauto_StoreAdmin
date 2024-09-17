import { useEffect, useState } from 'react';
import basicService from 'Frontend/services/basicService';
import Form from './Form';

function DataHandlerCreate({ setRows }) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
  });

  const closeModal = () => {
    setOpen(false);
    setFormValues({});
  }
  
  const [dialogIsOpen, setIsOpen] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault();
    if (parseInt(paymentState.toPay) <= parseInt(paymentState.payed)) {
      basicService.post("admin/HBL/", newHBL)
        .then((response) => {
          setRows(prevState => [response.data, ...prevState])
        })
        .then(() => closeModal(false));
    }
  };

  return (
    <>
      <DialogWrapper stateOfModal={{ open, setOpen }}>
        <div className="h-[90vh] w-[95vw] flex flex-col items-center justify-center">
          <Form
            formValues={{ formValues, setFormValues }}
            handleSubmit={handleSubmit}
            closeModal={closeModal}
            headerText={"Crear Orden"}
          />
        </div>
      </DialogWrapper>
      <button
        className="bg-orange-700 text-white rounded-3xl m-1 px-2 w-36 flex items-center justify-end font-bold text-xs"
        onClick={() => setOpen(true)}
      >
        Crear Orden
      </button>
    </>
  );
}

export default DataHandlerCreate;


import Modal from "Frontend/layouts/ModalGenerator";
import { useEffect, useState } from 'react';
import basicService from 'Frontend/services/basicService';
import Form from './Form';
import { MdModeEditOutline } from "react-icons/md";

function DataHandlerEdit({ row, rowState }) {
  const { setRows } = rowState;
  useEffect(() => {
    setFormValues(row.sender)
  }, [])

  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: "" });

  const closeModal = () => {
    setOpen(false);
    setFormValues({});
  }

  const handleSubmit = ( event ) => {
    event.preventDefault();
    basicService.put("admin/HBL/" + row._id, formValues)
      .then(() => setRows(prevState => {
        const data = prevState.filter(e => e._id !== row._id);
        return [...data, newHBL];
      }))
      .then(() => closeModal(false));
  }

  return (
    <>
      <Modal stateOfModal={{ open, setOpen }}>
        <div className="h-[90vh] w-[95vh] flex flex-col">
          <Form
            formValues={{ formValues, setFormValues }}
            handleSubmit={handleSubmit}
            closeModal={closeModal}
          />
        </div>
      </Modal>
      <MdModeEditOutline
        className="hover:text-orange-600 cursor-pointer"
        onClick={() => setOpen(true)}
      />
    </>
  );
}

export default DataHandlerEdit;

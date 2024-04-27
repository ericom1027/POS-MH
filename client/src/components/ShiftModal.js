// import React from "react";
// import { Button, Form, Modal } from "react-bootstrap";

// const ShiftModal = ({
//   show,
//   handleClose,
//   handleOpenShift,
//   handleCloseShift,
//   newShift,
//   setNewShift,
//   closingShift,
//   setClosingShift,
// }) => {
//   return (
//     <Modal className="mt-5" show={show} onHide={handleClose}>
//       <Modal.Header closeButton>
//         <Modal.Title>Shift Management</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <div>
//           <h4>Open Shift</h4>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Starting Cash</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter Starting Cash"
//                 value={newShift.startingCash}
//                 onChange={(e) =>
//                   setNewShift({ ...newShift, startingCash: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Button variant="primary" onClick={handleOpenShift}>
//               Open Shift
//             </Button>
//           </Form>
//         </div>
//         <div className="mt-4">
//           <h4>Close Shift</h4>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Ending Cash</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter Ending Cash"
//                 value={closingShift.endingCash}
//                 onChange={(e) =>
//                   setClosingShift({
//                     ...closingShift,
//                     endingCash: e.target.value,
//                   })
//                 }
//               />
//             </Form.Group>
//             <Button variant="primary" onClick={handleCloseShift}>
//               Close Shift
//             </Button>
//           </Form>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ShiftModal;

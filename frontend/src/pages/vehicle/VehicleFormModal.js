// 📁 VehicleFormModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

const VehicleFormModal = ({ open, onCancel, onSubmit, form, isEdit }) => {
  // 모달 열릴 때마다(selected 변경 or open=true) 폼에 초기값 세팅
  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      form.resetFields();
    }
    // (VehiclePage에서 이미 setFieldsValue 해 주므로
    //  여기서는 추가 작업 필요 없습니다)
  }, [open, isEdit, form]);

  return (
    <Modal
      open={open}
      title={isEdit ? "차량 수정" : "차량 등록"}
      onCancel={onCancel}
      onOk={onSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="vin"
          label="VIN"
          rules={[{ required: true, message: "VIN을 입력하세요" }]}
        >
          <Input /> {/* disabled 속성 제거 */}
        </Form.Item>
        <Form.Item name="model" label="모델명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="plate_number"
          label="번호판"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="year" label="연식">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleFormModal;

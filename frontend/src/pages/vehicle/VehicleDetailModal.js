import React from "react";
import { Modal, Descriptions } from "antd";

const VehicleDetailModal = ({ open, onCancel, vehicle }) => (
  <Modal open={open} onCancel={onCancel} footer={null} title="차량 상세 정보">
    {vehicle && (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="VIN">{vehicle.vin}</Descriptions.Item>
        <Descriptions.Item label="모델">{vehicle.model}</Descriptions.Item>
        <Descriptions.Item label="번호판">
          {vehicle.plate_number}
        </Descriptions.Item>
        <Descriptions.Item label="연식">{vehicle.year}</Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default VehicleDetailModal;

import React from "react";
import { Form, Input } from "antd";

export default function VehicleInfo({ initial }) {
  return (
    <>
      <Form.Item label="차량 이름" name="vehicle_name">
        <Input disabled />
      </Form.Item>
      <Form.Item label="차량 번호" name="vehicle_plate">
        <Input disabled />
      </Form.Item>
    </>
  );
}

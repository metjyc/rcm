import React from "react";
import { Form, Input } from "antd";

export default function DispatchReturnSection() {
  return (
    <>
      <Form.Item label="배차 위치" name="dispatch_location">
        <Input placeholder="예: 본사, 지점명 등" />
      </Form.Item>
      <Form.Item label="반납 위치" name="return_location">
        <Input placeholder="예: 본사, 지점명 등" />
      </Form.Item>
    </>
  );
}

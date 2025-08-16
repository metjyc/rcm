import React from "react";
import { Form, Select } from "antd";

export default function PaymentSection() {
  return (
    <>
      <Form.Item
        label="수납 상태"
        name="payment_status"
        rules={[{ required: true, message: "수납 상태를 선택하세요" }]}
      >
        <Select placeholder="선택">
          <Select.Option value="PAID">완납</Select.Option>
          <Select.Option value="UNPAID">미납</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="결제 방법"
        name="payment_method"
        rules={[{ required: true, message: "결제 방법을 선택하세요" }]}
      >
        <Select placeholder="선택">
          <Select.Option value="CASH">현금</Select.Option>
          <Select.Option value="CARD">카드</Select.Option>
          <Select.Option value="TRANSFER">이체</Select.Option>
        </Select>
      </Form.Item>
    </>
  );
}

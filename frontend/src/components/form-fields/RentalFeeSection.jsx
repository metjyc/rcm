import React from "react";
import { Form, InputNumber } from "antd";

export default function RentalFeeSection() {
  return (
    <>
      <Form.Item
        label="일일 요금"
        name="daily_price"
        rules={[{ required: true, message: "일일 요금을 입력하세요" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={(v) => `${v}원`}
          parser={(v) => String(v).replace(/원/g, "")}
        />
      </Form.Item>
      <Form.Item label="할인" name="discount">
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          max={100}
          formatter={(v) => `${v}%`}
          parser={(v) => String(v).replace(/%/g, "")}
        />
      </Form.Item>
    </>
  );
}

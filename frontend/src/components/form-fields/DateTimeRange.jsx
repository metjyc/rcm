import React from "react";
import { Form, DatePicker, Row, Col } from "antd";

export default function DateTimeRange() {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="시작 일시"
          name="start"
          rules={[{ required: true, message: "시작 일시를 선택하세요" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="종료 일시"
          name="end"
          rules={[{ required: true, message: "종료 일시를 선택하세요" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}

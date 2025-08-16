// 📁 src/pages/customer/CustomerFormModal.js
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Select, Button } from "antd";
import DaumPostcode from "react-daum-postcode";

const CustomerFormModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  isEdit,
  customer,
}) => {
  const [pcOpen, setPcOpen] = useState(false);

  // 모달 열릴 때마다 기존값 세팅
  useEffect(() => {
    if (!open) return;
    if (customer) {
      const [p0 = "", p1 = "", p2 = ""] =
        customer.phone_number?.split("-") || [];
      const [s0 = "", s1 = ""] = customer.ssn?.split("-") || [];
      form.setFieldsValue({
        name: customer.name,
        phone_number: [p0, p1, p2],
        email: customer.email,
        ssn: [s0, s1],
        birthdate: customer.birthdate?.split("T")[0] || null,
        gender: customer.gender || null,
        license_number: customer.license_number || "",
        license_expiry: customer.license_expiry?.split("T")[0] || null,
        note: customer.note || "",
        is_blacklisted: !!customer.is_blacklisted,
        // 새로 추가하는 주소 필드
        zipcode: customer.zipcode || "",
        address: customer.address || "",
        address_detail: customer.address_detail || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, customer, form]);

  return (
    <>
      <Modal
        forceRender
        open={open}
        onCancel={onCancel}
        onOk={onSubmit}
        title={isEdit ? "고객 수정" : "고객 등록"}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: "이름은 필수입니다" }]}
          >
            <Input />
          </Form.Item>

          {/* 연락처 */}
          <Form.Item label="연락처">
            <Input.Group compact>
              <Form.Item name={["phone_number", 0]} noStyle>
                <Input
                  style={{ width: "30%" }}
                  maxLength={3}
                  placeholder="010"
                />
              </Form.Item>
              <Form.Item name={["phone_number", 1]} noStyle>
                <Input
                  style={{ width: "30%" }}
                  maxLength={4}
                  placeholder="1234"
                />
              </Form.Item>
              <Form.Item name={["phone_number", 2]} noStyle>
                <Input
                  style={{ width: "30%" }}
                  maxLength={4}
                  placeholder="5678"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          {/* 이메일 */}
          <Form.Item name="email" label="이메일">
            <Input />
          </Form.Item>

          {/* 우편번호 검색 */}
          <Form.Item label="우편번호" name="zipcode">
            <Input
              readOnly
              placeholder="우편번호 검색"
              style={{ width: "80%" }}
              addonAfter={<Button onClick={() => setPcOpen(true)}>검색</Button>}
            />
          </Form.Item>

          {/* 기본주소 */}
          <Form.Item label="기본주소" name="address">
            <Input readOnly placeholder="검색 후 자동 입력" />
          </Form.Item>

          {/* 상세주소 */}
          <Form.Item label="상세주소" name="address_detail">
            <Input placeholder="예) 건물명, 동·호수" />
          </Form.Item>

          {/* 주민등록번호 */}
          <Form.Item label="주민등록번호">
            <Input.Group compact>
              <Form.Item name={["ssn", 0]} noStyle>
                <Input
                  style={{ width: "45%" }}
                  maxLength={6}
                  placeholder="YYMMDD"
                />
              </Form.Item>
              <Form.Item name={["ssn", 1]} noStyle>
                <Input
                  style={{ width: "45%" }}
                  maxLength={7}
                  placeholder="1234567"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          {/* 생년월일 */}
          <Form.Item name="birthdate" label="생년월일">
            <Input type="date" />
          </Form.Item>

          {/* 성별 */}
          <Form.Item name="gender" label="성별">
            <Select placeholder="선택">
              <Select.Option value="M">남</Select.Option>
              <Select.Option value="F">여</Select.Option>
            </Select>
          </Form.Item>

          {/* 면허번호 */}
          <Form.Item name="license_number" label="면허번호">
            <Input />
          </Form.Item>

          {/* 면허 만료일 */}
          <Form.Item name="license_expiry" label="면허 만료일">
            <Input type="date" />
          </Form.Item>

          {/* 메모 */}
          <Form.Item name="note" label="메모">
            <Input.TextArea rows={3} />
          </Form.Item>

          {/* 블랙리스트 */}
          <Form.Item
            name="is_blacklisted"
            label="블랙리스트 여부"
            valuePropName="checked"
          >
            <Switch checkedChildren="블랙" unCheckedChildren="정상" />
          </Form.Item>
        </Form>
      </Modal>

      {/* DaumPostcode 전용 검색 모달 */}
      <Modal
        open={pcOpen}
        footer={null}
        onCancel={() => setPcOpen(false)}
        width={400}
      >
        <DaumPostcode
          onComplete={(data) => {
            const { zonecode, address } = data;
            form.setFieldsValue({ zipcode: zonecode, address });
            setPcOpen(false);
          }}
          autoClose={false}
        />
      </Modal>
    </>
  );
};

export default CustomerFormModal;

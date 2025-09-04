import React, { useState } from "react";
import {
  Form,
  message,
  Modal,
  Space,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
} from "antd";
import DaumPostcode from "react-daum-postcode";
import dayjs from "dayjs";
import { createCustomer } from "../../util/RentcarAPI";

const rowGapStyle = { marginBottom: 8 }; // 줄 간격을 얕게

export default function QuickCustomerForm({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [addrOpen, setAddrOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 나중에 필요하면 공백 제거하는 코드 작성

  const strip = (v) => (typeof v === "string" ? v.replace(/\s|-/g, "") : v);

  const handleFinish = async (values) => {
    try {
      setSaving(true);

      const payload = {
        name: values.name,
        // || null 로 표시된 부분은 선택사항이라 백엔드에서 빈값이면 무시
        phone_number: values.phone_number || null,
        ssn: values.ssn || null,
        //면허 관련
        license_number: values.license_number || null,
        license_expiry: values.license_expiry
          ? dayjs(values.license_expiry).format("YYYY-MM-DD")
          : null,
        license_type: values.license_type || null,
        insurance_age: values.insurance_age || null,
        //주소
        zipcode: values.zipcode || null,
        address: values.address || null,
        address_detail: values.address_detail || null,
      };

      // 포맷팅 하는 코드 빠짐 위의 공백 제거 코드 strip 메소드 사용하는 코드
      if (payload.phone_number)
        payload.phone_number = strip(payload.phone_number);
      if (payload.ssn) payload.ssn = strip(payload.ssn);
      if (payload.license_number)
        payload.license_number = strip(payload.license_number);

      const res = await createCustomer(payload);
      message.success("고객이 추가 되었습니다.");
      form.resetFields();

      // API가 customer_id를 돌려주면 즉시 선택, 아니면 상위에서 재조회
      onSuccess?.(res);
      onClose?.();
    } catch (e) {
      message.error("고객 추가 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="신규 고객 빠른 추가"
        onCancel={onClose}
        footer={null}
        destroyOnClose
        width={520} // 기존 고객 폼 보다 작아야한다.
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* 운전자명 + 찾기 버튼(후속 확장용) */}
          <Form.Item
            label="운전자명"
            name="name"
            rules={[{ required: true, message: "이름은 필수입니다." }]}
            style={rowGapStyle}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="예) 정예찬" />
              <Button type="default">찾기</Button>
            </Space.Compact>
          </Form.Item>

          {/* 생년/사업 (주민번호/사업자번호) */}
          <Form.Item label="생년/사업" name="ssn" style={rowGapStyle}>
            <Input maxLength={14} />
          </Form.Item>

          {/* 휴대번호 */}
          <Form.Item
            label="휴대번호"
            name="phone_number"
            rules={[{ required: true, message: "연락처를 입력하세요." }]}
            style={rowGapStyle}
          >
            <Input placeholder="010-1234-5678" maxLength={20} />
          </Form.Item>
          {/* 면허종별/ 보험 연령 */}
          <Form.Item label="면허종별/보험 연령" style={rowGapStyle}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="license_type" noStyle>
                <Select
                  placeholder="면허종별"
                  options={[
                    { label: "1종보통", value: "1종보통" },
                    { label: "2종보통", value: "2종보통" },
                    { label: "1종대형", value: "1종대형" },
                    { label: "국제", value: "국제" },
                  ]}
                  allowClear
                />
              </Form.Item>
              <Form.Item name="insurance_age" noStyle>
                <InputNumber
                  style={{ width: "35%" }}
                  placeholder="보험연령"
                  min={0}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          {/* 면허번호 + 진위 버튼(후속 확장용) */}
          <Form.Item label="면허번호" name="license_number" style={rowGapStyle}>
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="예) 11-16-025320-70" maxLength={20} />
              <Button>진위</Button>
            </Space.Compact>
          </Form.Item>

          {/* 유효기간 */}
          <Form.Item label="유효기간" name="license_expiry" style={rowGapStyle}>
            <DatePicker style={{ width: "100%" }} placeholder="YYYY-MM-DD" />
          </Form.Item>

          {/* 우편번호 + 검색 */}
          <Form.Item label="우편번호" name="zipcode" style={rowGapStyle}>
            <Space.Compact style={{ width: "100%" }}>
              <Input readOnly placeholder="우편번호" />
              <Button onClick={() => setAddrOpen(true)}>검색</Button>
            </Space.Compact>
          </Form.Item>

          {/* 기본주소 */}
          <Form.Item label="기본주소" name="address" style={rowGapStyle}>
            <Input readOnly placeholder="검색 후 자동 입력" />
          </Form.Item>

          {/* 상세주소 */}
          <Form.Item label="상세주소" name="address_detail" style={rowGapStyle}>
            <Input placeholder="예) 소흘읍 호국로 243-18 (건물명/동·호수)" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 12 }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              취소
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              저장
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 주소 검색 모달 */}
      <Modal
        open={addrOpen}
        onCancel={() => setAddrOpen(false)}
        footer={null}
        width={420}
        destroyOnClose
      >
        <DaumPostcode
          onComplete={(data) => {
            form.setFieldsValue({
              zipcode: data.zonecode,
              address: data.address,
            });
            setAddrOpen(false);
          }}
          autoClose={false}
        />
      </Modal>
    </>
  );
}

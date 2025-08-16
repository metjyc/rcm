// 📁 CustomerDetailModal.js
import React from "react";
import { Modal } from "antd";
import dayjs from "dayjs";

const fieldLabels = {
  name: "이름",
  phone_number: "연락처",
  email: "이메일",
  zipcode: "우편번호",
  address: "도로명 주소",
  address_detail: "상세 주소",
  ssn: "주민등록번호",
  birthdate: "생년월일",
  gender: "성별",
  license_number: "면허번호",
  license_expiry: "면허 만료일",
  registration_date: "최초 등록일",
  note: "메모",
  is_blacklisted: "블랙리스트 여부",
  company_name: "회사 이름", // ← 추가
};

const formatValue = (key, value) => {
  if (key === "is_blacklisted") return value ? "블랙리스트" : "정상";
  if (key === "gender")
    return value === "M" ? "남" : value === "F" ? "여" : "-";
  if (
    ["birthdate", "license_expiry", "registration_date"].includes(key) &&
    value
  )
    return dayjs(value).format("YYYY-MM-DD");
  return value ?? "-";
};

const CustomerDetailModal = ({ open, customer, onCancel }) => (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={null}
    title="고객 상세 정보"
    destroyOnClose
  >
    {customer && (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(customer).map(([key, val]) => {
          // customer_id와 company_id는 건너뛰기
          if (key === "customer_id" || key === "company_id") return null;
          // company_name은 label + 값으로 표시
          return (
            <div key={key} style={{ display: "flex" }}>
              <strong style={{ width: 120 }}>{fieldLabels[key] || key}</strong>
              <span>{formatValue(key, val)}</span>
            </div>
          );
        })}
      </div>
    )}
  </Modal>
);

export default CustomerDetailModal;

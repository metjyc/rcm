// 📁 src/components/ReservationFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Divider, Row, Col, message } from "antd";
import dayjs from "dayjs";

import CustomerSelect from "./form-fields/CustomerSelect";
import RentalFeeSection from "./form-fields/RentalFeeSection";
import DispatchReturnSection from "./form-fields/DispatchReturnSection";
import PaymentSection from "./form-fields/PaymentSection";
import VehicleInfo from "./form-fields/VehicleInfo";
import DateTimeRange from "./form-fields/DateTimeRange";

import { fetchReservations, createCustomer } from "../util/RentcarAPI";

export default function ReservationFormModal({
  open,
  formMode = "create",
  initial = {},
  onCancel,
  onOk,
  onDelete,
}) {
  const [form] = Form.useForm();
  const [allRes, setAllRes] = useState([]);
  const dividerStyle = { margin: "16px 0 8px", fontWeight: "bold" };

  useEffect(() => {
    if (!open) return;
    form.resetFields();

    if (formMode === "edit") {
      form.setFieldsValue({
        reservation_id: initial.reservation_id,
        vin: initial.vin,
        vehicle_name: initial.name,
        vehicle_plate: initial.plate,
        start: dayjs(initial.start_datetime),
        end: dayjs(initial.end_datetime),
        customer_id: initial.customer_id,
        // 부가 필드들…
        daily_price: initial.daily_price,
        discount: initial.discount,
        dispatch_location: initial.dispatch_location,
        return_location: initial.return_location,
        payment_status: initial.payment_status,
        payment_method: initial.payment_method,
      });
    } else {
      form.setFieldsValue({
        vin: initial.vin,
        vehicle_name: initial.name,
        vehicle_plate: initial.plate,
        start: initial.date ? dayjs(initial.date) : null,
        end: initial.date ? dayjs(initial.date) : null,
      });
    }

    fetchReservations()
      .then(setAllRes)
      .catch(() => {
        message.warning("충돌 검사용 예약 로드에 실패했습니다.");
        setAllRes([]);
      });
  }, [open, formMode, initial, form]);

  // 겹침 체크 유틸
  const overlaps = (aStart, aEnd, bStart, bEnd) =>
    aEnd > bStart && aStart < bEnd;

  const handleFinish = async (values) => {
    const { vin, start, end } = values;

    if (!start || !end) return message.error("시작/종료일시를 모두 선택하세요");
    if (end.isBefore(start))
      return message.error("종료일시는 시작일시 이후여야 합니다");

    // 1) 충돌 검사
    const ns = start.valueOf();
    const ne = end.valueOf();
    const conflict = allRes.some((r) => {
      if (r.vin !== vin) return false;
      if (formMode === "edit" && r.reservation_id === initial.reservation_id)
        return false;
      const s = dayjs(r.start_datetime).valueOf();
      const e = dayjs(r.end_datetime).valueOf();
      return overlaps(s, e, ns, ne);
    });
    if (conflict)
      return message.error("해당 차량에 겹치는 예약이 이미 존재합니다.");

    // 2) 고객 ID 확보: 선택된 고객이 없고 신규 드래프트가 있으면 지금 생성
    let customerId = values.customer_id;
    const draft = values.__new_customer;
    if (!customerId && draft) {
      // 약간의 정규화(하이픈 제거 등) — 필요시 추가
      const strip = (v) => (typeof v === "string" ? v.replace(/\s|-/g, "") : v);

      const payloadCustomer = {
        name: draft.name,
        phone_number: strip(draft.phone_number) || null,
        ssn: strip(draft.ssn) || null,
        license_number: strip(draft.license_number) || null,
        license_expiry: draft.license_expiry || null,
        license_type: draft.license_type || null,
        insurance_age: draft.insurance_age || null,
        zipcode: draft.zipcode || null,
        address: draft.address || null,
        address_detail: draft.address_detail || null,
        note: draft.note || null,
        is_blacklisted: draft.is_blacklisted ? 1 : 0,
      };

      try {
        const created = await createCustomer(payloadCustomer);
        // 백엔드가 {customer_id: X} 또는 {insertId: X} 반환하는 형태에 맞춰 처리
        customerId = created.customer_id || created.insertId;
        if (!customerId) throw new Error("customer_id 파싱 실패");
        message.success("신규 고객이 생성되었습니다.");
        // 폼 상태도 동기화
        form.setFieldsValue({ customer_id: customerId, __new_customer: null });
      } catch (err) {
        console.error("고객 생성 실패:", err);
        return message.error("고객 생성 실패로 예약 저장을 중단합니다.");
      }
    }

    if (!customerId) {
      return message.error("고객을 선택하거나 신규 고객 정보를 입력하세요.");
    }

    // 3) 예약 payload
    const payload = {
      vin,
      customer_id: customerId,
      start_datetime: start.format("YYYY-MM-DD HH:mm:ss"),
      end_datetime: end.format("YYYY-MM-DD HH:mm:ss"),
      daily_price: values.daily_price,
      discount: values.discount,
      dispatch_location: values.dispatch_location,
      return_location: values.return_location,
      payment_status: values.payment_status,
      payment_method: values.payment_method,
    };

    try {
      await onOk(payload);
      message.success(
        formMode === "create" ? "예약 생성 완료" : "예약 수정 완료"
      );
      onCancel();
    } catch {
      message.error(
        formMode === "create" ? "예약 생성 실패" : "예약 수정 실패"
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await onDelete(initial.reservation_id);
      message.success("예약이 삭제되었습니다.");
      onCancel();
    } catch {
      message.error("삭제에 실패했습니다.");
    }
  };

  return (
    <Modal
      open={open}
      wrapClassName="reservation-modal"
      title={formMode === "create" ? "새 예약 생성" : "예약 수정"}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* 1 & 2 */}
        <Row gutter={16} align="top">
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              1. 고객 정보
            </Divider>
            <CustomerSelect
              initialCustomerId={initial.customer_id}
              form={form}
            />
          </Col>
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              2. 대여 요금
            </Divider>
            <RentalFeeSection />
          </Col>
        </Row>

        {/* 3 & 4 */}
        <Row gutter={16} align="top">
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              3. 배차 / 반납 정보
            </Divider>
            <DispatchReturnSection />
          </Col>
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              4. 수납 정보
            </Divider>
            <PaymentSection />
          </Col>
        </Row>

        {/* 5 & 6 */}
        <Row gutter={16} align="top">
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              5. 차량 정보
            </Divider>
            <VehicleInfo initial={initial} />
          </Col>
          <Col span={12}>
            <Divider orientation="left" style={dividerStyle}>
              6. 예약 기간
            </Divider>
            <DateTimeRange />
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            취소
          </Button>
          {formMode === "edit" && (
            <Button
              danger
              htmlType="button"
              onClick={handleDelete}
              style={{ marginRight: 8 }}
            >
              삭제
            </Button>
          )}
          <Button type="primary" htmlType="submit">
            {formMode === "create" ? "생성" : "저장"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

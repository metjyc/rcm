import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Divider, Row, Col, message } from "antd";
import dayjs from "dayjs";

import CustomerSelect from "./form-fields/CustomerSelect";
import RentalFeeSection from "./form-fields/RentalFeeSection";
import DispatchReturnSection from "./form-fields/DispatchReturnSection";
import PaymentSection from "./form-fields/PaymentSection";
import VehicleInfo from "./form-fields/VehicleInfo";
import DateTimeRange from "./form-fields/DateTimeRange";

import { fetchReservations } from "../util/RentcarAPI";

export default function ReservationFormModal({
  open,
  formMode = "create",
  initial = {},
  onCancel,
  onOk,
  onDelete,
}) {
  const [form] = Form.useForm(); // antd 폼 인스턴스
  const [allRes, setAllRes] = useState([]); // 모달이 열릴 때 예약 목록을 불러와서 겹침 확인에 사용

  // Divider 공통 스타일
  const dividerStyle = { margin: "16px 0 8px", fontWeight: "bold" };

  useEffect(() => {
    if (!open) return;
    form.resetFields();

    // 초기값 세팅
    if (formMode === "edit") {
      // 수정 모드: DB에 있는 예약 값을 폼에 꽂아넣음
      form.setFieldsValue({
        reservation_id: initial.reservation_id,
        vin: initial.vin,
        vehicle_name: initial.name,
        vehicle_plate: initial.plate,
        start: dayjs(initial.start_datetime),
        end: dayjs(initial.end_datetime),
        customer_id: initial.customer_id,
        daily_price: initial.daily_price,
        discount: initial.discount,
        dispatch_location: initial.dispatch_location,
        return_location: initial.return_location,
        payment_status: initial.payment_status,
        payment_method: initial.payment_method,
      });
    } else {
      // 생성 모드: 선택된 차량/날짜 정도만 기본값으로
      form.setFieldsValue({
        vin: initial.vin,
        vehicle_name: initial.name,
        vehicle_plate: initial.plate,
        start: initial.date ? dayjs(initial.date) : null,
        end: initial.date ? dayjs(initial.date) : null,
        customer_id: null,
        daily_price: null,
        discount: null,
        dispatch_location: "",
        return_location: "",
        payment_status: null,
        payment_method: null,
      });
    }

    // 충돌 검사용 예약 로드
    fetchReservations()
      .then(setAllRes)
      .catch(() => {
        message.warning("충돌 검사용 예약 로드에 실패했습니다.");
        setAllRes([]);
      });
  }, [open, formMode, initial, form]);

  const handleFinish = async (values) => {
    const { vin, start, end, customer_id } = values;
    // 기본 검증
    if (!start || !end) {
      return message.error("시작/종료일시를 모두 선택하세요");
    }
    if (end.isBefore(start)) {
      return message.error("종료일시는 시작일시 이후여야 합니다");
    }

    // 충돌 검사 (같은 차량이고 시간이 겹치는 예약이 있는지)
    const ns = start.valueOf(),
      ne = end.valueOf();
    const conflict = allRes.some((r) => {
      if (r.vin !== vin) return false;
      // 수정일 경우 자기 자신은 제외
      if (formMode === "edit" && r.reservation_id === initial.reservation_id)
        return false;
      const s = dayjs(r.start_datetime).valueOf();
      const e = dayjs(r.end_datetime).valueOf();
      // !(e <= ns || s >= ne) == 겹침
      return !(e <= ns || s >= ne);
    });
    if (conflict) {
      return message.error("해당 차량에 겹치는 예약이 이미 존재합니다.");
    }

    // 서버로 보낼 payload 구성값
    const payload = {
      vin,
      customer_id,
      start_datetime: start.format("YYYY-MM-DD HH:mm:ss"),
      end_datetime: end.format("YYYY-MM-DD HH:mm:ss"),
      daily_price: values.daily_price,
      discount: values.discount,
      dispatch_location: values.dispatch_location,
      return_location: values.return_location,
      payment_status: values.payment_status,
      payment_method: values.payment_method,
    };

    // 부모의 onOK 호출(성공/실패 메세지 처리)
    try {
      await onOk(payload);
      message.success(
        formMode === "create" ? "예약 생성 완료" : "예약 수정 완료"
      );
      onCancel(); // 자동 닫기
    } catch {
      message.error(
        formMode === "create"
          ? "예약 생성에 실패했습니다."
          : "예약 수정에 실패했습니다."
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
            <CustomerSelect initialCustomerId={initial.customer_id} />
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

        {/* 버튼 */}
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

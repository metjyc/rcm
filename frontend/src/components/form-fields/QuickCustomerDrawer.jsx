// 📁 src/components/QuickCustomerDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Tabs,
  Input,
  List,
  Form,
  Button,
  Space,
  Switch,
  message,
} from "antd";
import { fetchCustomers } from "../../util/RentcarAPI";

const { Search } = Input;

export default function QuickCustomerDrawer({
  open,
  onClose,
  onPickExisting, // (customer) => void  기존 선택
  onDraftCreate, // (draft) => void    신규 임시 저장(예약 저장 시 생성)
}) {
  const [tab, setTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCustomers();
        setAll(data || []);
      } catch {
        message.error("고객 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    })();

    // 폼/상태 초기화
    form.resetFields();
    setQ("");
    setTab("search");
  }, [open, form]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return all;
    return all.filter((c) =>
      [c.name, c.phone_number, c.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(k))
    );
  }, [q, all]);

  const handlePick = (c) => {
    onPickExisting?.(c);
    onClose?.();
  };

  const handleDraftSubmit = async () => {
    try {
      const v = await form.validateFields();
      onDraftCreate?.({
        name: v.name,
        phone_number: v.phone_number || null,
        ssn: v.ssn || null,
        license_number: v.license_number || null,
        license_expiry: v.license_expiry || null,
        license_type: v.license_type || null,
        insurance_age: v.insurance_age || null,
        zipcode: v.zipcode || null,
        address: v.address || null,
        address_detail: v.address_detail || null,
        note: v.note || null,
        is_blacklisted: v.is_blacklisted ? 1 : 0,
      });
      onClose?.();
      message.info("신규 고객이 임시 저장되었습니다. (예약 저장 시 실제 생성)");
    } catch {
      /* antd가 유효성 메시지 보여줌 */
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title="고객 검색 / 빠른 등록"
      destroyOnClose
    >
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "search", label: "검색/선택" },
          { key: "new", label: "신규 간이 등록" },
        ]}
      />

      {tab === "search" && (
        <>
          <Search
            placeholder="이름 / 전화 / 이메일로 검색"
            allowClear
            onSearch={setQ}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <List
            loading={loading}
            bordered
            dataSource={filtered}
            locale={{ emptyText: "검색 결과 없음" }}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => handlePick(item)}
              >
                <Space direction="vertical" size={0}>
                  <strong>{item.name}</strong>
                  <span style={{ color: "#888" }}>
                    {item.phone_number || "-"} · {item.email || "-"}
                  </span>
                </Space>
              </List.Item>
            )}
            style={{ maxHeight: 420, overflow: "auto" }}
          />
        </>
      )}

      {tab === "new" && (
        <Form form={form} layout="vertical">
          <Form.Item
            label="이름"
            name="name"
            rules={[{ required: true, message: "이름을 입력하세요" }]}
          >
            <Input placeholder="예) 홍길동" />
          </Form.Item>

          <Form.Item label="연락처" name="phone_number">
            <Input placeholder="예) 010-1234-5678" />
          </Form.Item>

          <Form.Item label="주민등록번호" name="ssn">
            <Input placeholder="예) 900101-1234567" />
          </Form.Item>

          <Form.Item label="면허번호" name="license_number">
            <Input placeholder="예) 11-16-012345-67" />
          </Form.Item>

          <Form.Item label="면허 만료일" name="license_expiry">
            <Input type="date" />
          </Form.Item>

          <Form.Item label="면허종별" name="license_type">
            <Input placeholder="예) 2종보통" />
          </Form.Item>

          <Form.Item label="보험연령" name="insurance_age">
            <Input placeholder="예) 만26세 이상" />
          </Form.Item>

          <Form.Item label="우편번호" name="zipcode">
            <Input placeholder="예) 12345" />
          </Form.Item>

          <Form.Item label="주소" name="address">
            <Input placeholder="기본주소" />
          </Form.Item>

          <Form.Item label="상세주소" name="address_detail">
            <Input placeholder="동/호 등" />
          </Form.Item>

          <Form.Item label="메모" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="블랙리스트"
            name="is_blacklisted"
            valuePropName="checked"
            tooltip="체크 시 블랙리스트로 표시됩니다"
          >
            <Switch />
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>닫기</Button>
            <Button type="primary" onClick={handleDraftSubmit}>
              임시 저장 (예약 시 생성)
            </Button>
          </Space>
        </Form>
      )}
    </Drawer>
  );
}

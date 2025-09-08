// 📁 src/components/form-fields/CustomerSelect.jsx
import React, { useEffect, useState } from "react";
import { Form, Select, message, Divider, Button, Space, Tag } from "antd";
import { fetchCustomers } from "../../util/RentcarAPI";
import QuickCustomerDrawer from "./QuickCustomerDrawer";

export default function CustomerSelect({ initialCustomerId, form }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftPreview, setDraftPreview] = useState(null); // 드래프트 표시용

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data || []);
    } catch {
      message.error("고객 목록 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Drawer: 기존 고객 선택
  const onPickExisting = (c) => {
    setDraftPreview(null);
    form.setFieldsValue({
      customer_id: c.customer_id,
      __new_customer: null,
    });
    message.success(`선택됨: ${c.name}`);
  };

  // Drawer: 신규 임시 등록
  const onDraftCreate = (draft) => {
    setDraftPreview(draft);
    form.setFieldsValue({
      customer_id: null,
      __new_customer: draft, // 예약 저장 시 실제 생성
    });
  };

  return (
    <>
      {/* 숨김 필드: 예약 저장 시 읽어감 */}
      <Form.Item name="__new_customer" hidden>
        <input />
      </Form.Item>

      <Form.Item
        name="customer_id"
        label={
          <Space>
            고객 선택
            {draftPreview && <Tag color="gold">신규(저장 시 생성)</Tag>}
          </Space>
        }
        rules={[{ required: false }]} // 신규 드래프트가 있으면 없어도 됨
        initialValue={initialCustomerId}
        extra={
          draftPreview
            ? `${draftPreview.name} (${draftPreview.phone_number || "-"})`
            : undefined
        }
      >
        <Select
          allowClear
          loading={loading}
          placeholder="고객을 선택하세요"
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ padding: "4px 8px" }}>
                <Button
                  type="link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setDrawerOpen(true)}
                >
                  + 검색/빠른 등록 (Drawer)
                </Button>
              </div>
            </>
          )}
        >
          {customers.map((c) => (
            <Select.Option key={c.customer_id} value={c.customer_id}>
              {c.name} ({c.phone_number || "-"})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <QuickCustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onPickExisting={onPickExisting}
        onDraftCreate={onDraftCreate}
      />
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Form, Select, message, Divider } from "antd";
// ↓ 실제 파일 위치인 pages/customer 폴더로 import 경로를 바꿔주세요
import CustomerFormModal from "../../pages/customer/CustomerFormModal";
import { fetchCustomers, createCustomer } from "../../util/RentcarAPI";

export default function CustomerSelect({ initialCustomerId, form }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch {
      message.error("고객 목록 로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async (values) => {
    try {
      const newCust = await createCustomer(values);
      message.success("새 고객이 등록되었습니다.");
      setAddModalOpen(false);
      await loadCustomers();
      form.setFieldsValue({ customer_id: newCust.customer_id });
    } catch {
      message.error("고객 등록에 실패했습니다.");
    }
  };

  return (
    <>
      <Form.Item
        name="customer_id"
        label="고객 선택"
        rules={[{ required: true, message: "고객을 선택하세요" }]}
        initialValue={initialCustomerId}
      >
        <Select
          loading={loading}
          placeholder="고객 선택"
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{ padding: "4px 8px", cursor: "pointer" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setAddModalOpen(true)}
              >
                + 새 고객 추가
              </div>
            </>
          )}
        >
          {customers.map((c) => (
            <Select.Option key={c.customer_id} value={c.customer_id}>
              {c.name} ({c.phone_number})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <CustomerFormModal
        open={addModalOpen}
        isEdit={false}
        customer={null}
        onCancel={() => setAddModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </>
  );
}

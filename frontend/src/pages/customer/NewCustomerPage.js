import React, { useEffect, useState } from "react";
import { Form, Button, Input, Space, message } from "antd";
import CustomerTable from "./CustomerTable";
import CustomerFormModal from "./CustomerFormModal";
import CustomerDetailModal from "./CustomerDetailModal";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../util/RentcarAPI";

const NewCustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      const data = await fetchCustomers();
      setCustomers(data);
      setFiltered(data);
    })();
  }, []);

  const reload = async () => {
    const data = await fetchCustomers();
    setCustomers(data);
    setFiltered(data);
  };

  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    setFiltered(customers.filter((c) => c.name.includes(text)));
  };

  const handleAdd = () => {
    setSelected(null);
    form.resetFields();
    setFormOpen(true);
  };

  const handleEdit = (customer) => {
    setSelected(customer);
    // ▶ 여기서 바로 세팅
    form.setFieldsValue({
      name: customer.name,
      phone_number: customer.phone_number?.split("-") || [],
      ssn: customer.ssn?.split("-") || [],
      birthdate: customer.birthdate?.split("T")[0] || undefined,
      gender: customer.gender || undefined,
      license_number: customer.license_number || undefined,
      license_expiry: customer.license_expiry?.split("T")[0] || undefined,
      note: customer.note || "",
      is_blacklisted: !!customer.is_blacklisted,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields();
      vals.phone_number = vals.phone_number?.join("-") || null;
      vals.ssn = vals.ssn?.join("-") || null;
      vals.is_blacklisted = vals.is_blacklisted ? 1 : 0;

      if (selected) {
        await updateCustomer(selected.customer_id, vals);
        message.success("수정 완료");
      } else {
        await createCustomer(vals);
        message.success("등록 완료");
      }

      setFormOpen(false);
      form.resetFields();
      await reload();
    } catch {
      message.error("저장 실패");
    }
  };

  const handleDelete = async (id) => {
    await deleteCustomer(id);
    message.success("삭제 완료");
    await reload();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>고객 관리</h2>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          + 신규 등록
        </Button>
        <Input
          placeholder="이름 검색"
          value={searchText}
          onChange={handleSearch}
          allowClear
        />
      </Space>

      <CustomerTable
        customers={filtered}
        onDetail={(c) => {
          setSelected(c);
          setDetailOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CustomerFormModal
        open={isFormOpen} // ← open
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        isEdit={!!selected}
        customer={selected}
      />

      <CustomerDetailModal
        open={isDetailOpen}
        onCancel={() => setDetailOpen(false)}
        customer={selected}
      />
    </div>
  );
};

export default NewCustomerPage;

import React from "react";
import { Table, Tag, Button, Popconfirm } from "antd";

const CustomerTable = ({ customers, onDetail, onEdit, onDelete }) => {
  const columns = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "연락처",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "성별",
      dataIndex: "gender",
      key: "gender",
      render: (val) => (val === "M" ? "남" : val === "F" ? "여" : "-"),
    },
    {
      title: "블랙",
      dataIndex: "is_blacklisted",
      key: "is_blacklisted",
      render: (val) =>
        val ? <Tag color="red">Blacklisted</Tag> : <Tag>Normal</Tag>,
    },
    {
      title: "동작",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => onDetail(record)}>
            상세
          </Button>
          {/* 수정 버튼이 존재하는 곳 */}
          <Button type="link" onClick={() => onEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.customer_id)}
          >
            <Button type="link" danger>
              삭제
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={customers}
      rowKey="customer_id"
      bordered
      pagination={{ pageSize: 10 }}
    />
  );
};

export default CustomerTable;

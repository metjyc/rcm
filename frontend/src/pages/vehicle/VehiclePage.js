import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
  Space,
} from "antd";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../util/RentcarAPI";

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 검색 필터
  const [plateFilter, setPlateFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  // 차량 목록 불러오기
  const load = async () => {
    const list = await fetchVehicles();
    setVehicles(list);
    setFiltered(list);
  };

  // 검색 적용
  const applyFilter = () => {
    setFiltered(
      vehicles.filter((v) => {
        return (
          v.plate.includes(plateFilter) &&
          v.name.toLowerCase().includes(modelFilter.toLowerCase()) &&
          v.year.includes(yearFilter)
        );
      })
    );
  };

  // 삭제
  const handleDelete = async (vin) => {
    try {
      await deleteVehicle(vin);
      message.success("삭제 완료");
      load();
    } catch {
      message.error("삭제 실패");
    }
  };

  // 추가 모달 열기
  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 편집 모달 열기
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      vin: record.vin,
      name: record.name,
      plate: record.plate,
      year: record.year,
    });
    setModalVisible(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
    setEditing(null);
    form.resetFields();
  };

  // 모달 저장
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateVehicle(editing.vin, {
          vin: values.vin,
          name: values.name,
          plate: values.plate,
          year: values.year,
        });
        message.success("수정 완료");
      } else {
        await createVehicle(values);
        message.success("추가 완료");
      }
      closeModal();
      load();
    } catch {
      message.error("저장 실패");
    }
  };

  const columns = [
    { title: "차대번호", dataIndex: "vin", key: "vin" },
    { title: "모델", dataIndex: "name", key: "name" },
    { title: "번호판", dataIndex: "plate", key: "plate" },
    { title: "연식", dataIndex: "year", key: "year" },
    {
      title: "동작",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="정말 삭제할까요?"
            onConfirm={() => handleDelete(record.vin)}
          >
            <Button danger type="link">
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="번호판 검색"
          value={plateFilter}
          onChange={(e) => setPlateFilter(e.target.value)}
          onPressEnter={applyFilter}
          allowClear
        />
        <Input
          placeholder="모델 검색"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          onPressEnter={applyFilter}
          allowClear
        />
        <Input
          placeholder="연식 검색"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          onPressEnter={applyFilter}
          allowClear
        />
        <Button type="primary" onClick={applyFilter}>
          검색
        </Button>
        <Button
          type="default"
          onClick={() => {
            setPlateFilter("");
            setModelFilter("");
            setYearFilter("");
            setFiltered(vehicles);
          }}
        >
          초기화
        </Button>
        <Button type="primary" onClick={openAdd}>
          + 차량 추가
        </Button>
      </Space>

      <Table
        rowKey="vin"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editing ? "차량 정보 수정" : "차량 추가"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={handleOk}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vin"
            label="차대번호"
            rules={[{ required: true, message: "VIN을 입력하세요" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="모델"
            rules={[{ required: true, message: "모델을 입력하세요" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="plate"
            label="번호판"
            rules={[{ required: true, message: "번호판을 입력하세요" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="연식"
            rules={[{ required: true, message: "연식을 입력하세요" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VehiclePage;

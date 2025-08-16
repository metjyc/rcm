import React, { useState } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { CarOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";

const Sidebar = () => {
  const [openKeys, setOpenKeys] = useState([]);

  const toggleSubMenu = (key) => {
    if (openKeys.includes(key)) {
      setOpenKeys(openKeys.filter((k) => k !== key));
    } else {
      setOpenKeys([...openKeys, key]);
    }
  };

  const items = [
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: <span onClick={() => toggleSubMenu("calendar")}>일정 관리</span>,
      children: [
        {
          key: "daily_calendar",
          label: <Link to="/calendar">일일 현황</Link>,
        },
      ],
    },
    {
      key: "vehicle",
      icon: <CarOutlined />,
      label: <span onClick={() => toggleSubMenu("vehicle")}>차량 관리</span>,
      children: [
        {
          key: "vehicle_main",
          label: <Link to="/vehicle">차량 목록</Link>,
        },
        {
          key: "vehicle_add",
          label: <Link to="/vehicle/add">차량 추가</Link>,
        },
      ],
    },
    {
      key: "customer",
      icon: <UserOutlined />,
      label: <span onClick={() => toggleSubMenu("customer")}>고객 관리</span>,
      children: [
        {
          key: "customer_main",
          label: <Link to="/customer">고객 목록</Link>,
        },
        {
          key: "customer_add",
          label: <Link to="/customer/add">고객 추가</Link>,
        },
      ],
    },
  ];

  return (
    <div
      style={{
        width: 250,
        height: "100vh",
        background: "#001529",
        color: "#fff",
        padding: 10,
      }}
    >
      <Menu
        mode="inline"
        theme="dark"
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        style={{ borderRight: 0 }}
        items={items}
      />
    </div>
  );
};

export default Sidebar;

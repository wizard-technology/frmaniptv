import {
  Layout,
  Row,
  Col,
  Card,
  Table,
  Space,
  notification,
  Button,
  Input,
  Tooltip,
  Modal,
} from "antd";
import { DeleteFilled } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FrownOutlined,
  SmileOutlined,
  FileAddOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const openNotificationFailed = (message) => {
  notification.open({
    message: "Error",
    description: `${message}`,
    icon: <FrownOutlined style={{ color: "#f5222d" }} />,
  });
};
const openNotificationSuccess = (message) => {
  notification.open({
    message: "Successful",
    description: `${message}`,
    icon: <SmileOutlined style={{ color: "#108ee9" }} />,
  });
};
const Playlist = () => {
  const columns = [
    {
      title: "Playlist Name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      // render: (text) => <a>{text}</a>,
    },
    {
      title: "Timeout",
      dataIndex: "timeout",
      key: "timeout",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Delete Playlist">
            <Button
              type="primary"
              danger
              onClick={(e) => {
                axios
                  .delete(`http://localhost/api/channels/delete/${record.key}`)
                  .then((res) => {
                    if (res.status === 200) {
                      openNotificationSuccess(res.data["message"]);
                      setData([
                        ...data.filter(function (ele) {
                          return ele.key !== record.key;
                        }),
                      ]);
                    } else {
                      openNotificationFailed(res.data["message"]);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }}
              shape="circle"
              icon={<DeleteFilled />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({ url: "", timeout: 3 });

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    axios
      .post(
        `http://localhost/api/get`,
        {
          url: `${formData.url}`,
          timeout: `${formData.timeout}`,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          if (res.data["user_info"]["auth"] === 1) {
            setData([
              ...data,
              {
                name: res.data["user_info"]["username"],
                url: formData.url,
                timeout: formData.timeout,
              },
            ]);
            openNotificationSuccess("Added Playlist Successfull");
            setVisible(false);
            setFormData({ url: "", timeout: 3 });
          } else {
            openNotificationFailed("Authentication Faild");
          }
        }
        if (res.status === 404) {
          openNotificationFailed(res.status["message"]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost/api/channels")
      .then((res) => {
        if (res.status === 200) {
          setData(res.data["data"]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setLoading(false);
  }, []);

  return (
    <Content
      className="site-layout"
      style={{ padding: "0 50px", marginTop: 64 }}
    >
      <Row justify="space-between">
        <Col span={24}>
          <Card title="List Channels">
            <div>
              <Tooltip title="New">
                <Button
                  type="primary"
                  shape="round"
                  onClick={showModal}
                  icon={<FileAddOutlined />}
                >
                  Add New Playlist
                </Button>
              </Tooltip>
              <Modal
                title="Add New Playlist"
                visible={visible}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
              >
                <Input
                  value={formData.url}
                  onChange={(e) => {
                    setFormData({
                      url: e.target.value,
                      timeout: formData.timeout,
                    });
                  }}
                  placeholder="M3U Link"
                ></Input>
                <div style={{ height: "10px" }}></div>

                <Input
                  value={formData.timeout}
                  onChange={(e) => {
                    setFormData({
                      url: formData.url,
                      timeout: e.target.value,
                    });
                  }}
                  placeholder="Timeout"
                  type="number"
                ></Input>
              </Modal>
            </div>
            <div style={{ height: "20px" }}></div>

            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </Content>
  );
};
export default Playlist;

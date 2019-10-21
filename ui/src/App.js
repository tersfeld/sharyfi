import {
  Col,
  Icon,
  Layout,
  message,
  PageHeader,
  Row,
  Slider,
  Typography,
  Upload
} from "antd";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const { Content } = Layout;
const { Paragraph } = Typography;

const Dragger = Upload.Dragger;

export default function App(props) {
  const spanLinkRef = useRef(null);

  const [inputValue, setInputValue] = useState(4);
  const [fileList, setFileList] = useState([]);

  function getFileList() {
    const getFileListUrl =
      process.env.NODE_ENV === "production"
        ? `api/files/list/${inputValue}`
        : `:8080/api/files/list/${inputValue}`;
    axios.get(getFileListUrl).then(res => {
      const fileList = res.data;
      setFileList(fileList);
    });
  }

  useEffect(() => {
    getFileList();
  }, [inputValue]);

  const [selectedLink, setSelectedLink] = useState("");

  const styleTextArea = selectedLink === "" ? { display: "none" } : {};

  useEffect(() => {
    if (spanLinkRef && selectedLink !== "") {
      spanLinkRef.current.select();
      document.execCommand("copy");
      message.success(`Link has been copied to the clipboard !`);
      setSelectedLink("");
    }
  }, [selectedLink]);

  function onChange(value) {
    setInputValue(value, () => {
      console.log("after");
    });
  }

  function handleChange(info) {
    const status = info.file.status;
    if (status === "done") {
      console.log("done");
      message.success(`${info.file.name} file uploaded successfully.`);
      getFileList();
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
      getFileList();
    }

    let fileList = [...info.fileList];
    setFileList(fileList);
  }

  function handleRemove(file) {
    const deleteUrl =
      process.env.NODE_ENV === "production"
        ? "/api/files/delete"
        : ":8080/api/files/delete";
    return axios
      .post(deleteUrl, {
        filename: file.name
      })
      .then(res => {
        message.success(`${file.name} file deleted successfully.`);
        return true;
      })
      .catch(res => {
        return false;
      });
  }

  function handlePreview(file) {
    console.log(file.url[0]);
    setSelectedLink(file.url[0]);
  }

  function renderDragger() {
    const props = {
      name: "file",
      multiple: false,
      fileList: fileList,
      action:
        process.env.NODE_ENV === "production"
          ? "/api/files/upload"
          : ":8080/api/files/upload",
      onChange: handleChange,
      onRemove: handleRemove,
      onPreview: handlePreview
    };

    return (
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
      </Dragger>
    );
  }

  const content = (
    <div className="content">
      <Paragraph>
        Sharyfi is a secure file-sharing app for files that are too big to be
        sent as email's attachment.
      </Paragraph>
      <Paragraph>
        You can upload files up to 2000MB / 2GB. For extra security, each link
        are expiring after a while. You can configure the expiry time using the
        slider below (in days). After uploading a file, you can click on the
        link in the list and it will be directly copied to your clipboard for
        you to send.
      </Paragraph>
    </div>
  );

  return (
    <div>
      <Content style={{ padding: "0 50px" }}>
        <PageHeader title="Sharyfi">
          <div className="wrap">
            <div className="content">{content}</div>
          </div>
        </PageHeader>
        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <Row>
            <Col span={12}>
              Link expiry : {inputValue} days
              <Slider
                min={1}
                max={20}
                onChange={onChange}
                value={typeof inputValue === "number" ? inputValue : 0}
              />
            </Col>
          </Row>
          {renderDragger()}
          <textarea
            ref={spanLinkRef}
            value={selectedLink}
            readOnly
            style={styleTextArea}
          ></textarea>
        </div>
      </Content>
    </div>
  );
}

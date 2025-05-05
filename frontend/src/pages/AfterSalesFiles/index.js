import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from 'react-router-dom';
import { List, ListItem } from "@material-ui/core";

const AfterSalesFiles = ({}) => {
  const { afterSalesId } = useParams();
  const [files, setFiles] = useState([]);

  useEffect(async () => {

    try {
      const { data } = await api.get(`/aftersales/${afterSalesId}/details`);
      setFiles(data.filter(item => isFile(item) && !isPdf(item) && item.value));
    } catch (error) {
      
    }

  }, []);

  const isFile = (item) => item.name.toLowerCase().startsWith('img') && item.mediaPath;
  const isPdf = (item) => item.mediaPath.toLowerCase().endsWith('.pdf');


  return (
    <List>
    {files.map((file, index) => (
        <ListItem key={index}>{<img src={file.mediaPath} style={{width: '50%'}} />}</ListItem>
    ))}
    </List>
  )
}

export default AfterSalesFiles;
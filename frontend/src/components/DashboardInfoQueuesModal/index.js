import React, { useState, useEffect } from "react";
import { 
  Badge,
  Box, 
  Dialog, 
  DialogTitle, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow 
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { useTheme, useMediaQuery } from '@mui/material';
import { i18n } from "../../translate/i18n";


const DashboardInfoQueueModal = ({
  open,
  onClose,
  data
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [count, setCount] = useState(0);
  const info = data?.info || [];
  const midIndex = Math.ceil(info.length / 2);
  const column1 = info.slice(0, midIndex);
  const column2 = info.slice(midIndex);
  const combinedData = isMobile ? [...column1, ...column2] : [];
console.log()
  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    setCount(0)
    const total = data?.info?.reduce((sum, item) => sum + (Number(item.count) || 0), 0) || 0;
    setCount(total)
  }, [data?.desc]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <DialogTitle>
          <Badge
            badgeContent={count}
            color="primary"
            max={99999}
            sx={{ "& .MuiBadge-anchorOriginTopRightRectangle": { right: "-1.5rem !important" } }}
          >
            <span>{i18n.t("dashboard.infoQueuesModal.title")} {data?.desc}</span>
          </Badge>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </Box>
      <Paper variant="outlined" sx={{ marginInline: "1rem", marginBottom: "1rem" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("dashboard.infoQueuesModal.table.queueNameColumn")}</TableCell>
              <TableCell align="center">{i18n.t("dashboard.infoQueuesModal.table.queueQuantityColumn")}</TableCell>
              {!isMobile && <TableCell style={{ borderRight: "1px solid #ccc", width: "1px" }} />}
              {!isMobile && column2.length > 0 && (
                <>
                  <TableCell align="center">{i18n.t("dashboard.infoQueuesModal.table.queueNameColumn")}</TableCell>
                  <TableCell align="center">{i18n.t("dashboard.infoQueuesModal.table.queueQuantityColumn")}</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
          {isMobile ? (
              combinedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: item?.color || "#d3d3d385",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: item?.color ? "white" : "black",
                      }}
                    >
                      {item?.queueName || ""}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item?.count || ""}</TableCell>
                </TableRow>
              ))
            ) : (
              // Mantém o layout original no desktop
              Array.from({ length: Math.max(column1.length, column2.length) }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: column1[index]?.color || "#d3d3d385",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: column1[index]?.color ? "white" : "black",
                      }}
                    >
                      {column1[index]?.queueName || ""}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{column1[index]?.count || ""}</TableCell>
                  <TableCell style={{ borderRight: "1px solid #ccc", width: "1px" }} />
                  {column2[index] && (
                    <>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "inline-block",
                            padding: "8px 16px",
                            backgroundColor: column2[index]?.color || "#d3d3d385",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            fontWeight: "bold",
                            textAlign: "center",
                            color: column2[index]?.color ? "white" : "black",
                          }}
                        >
                          {column2[index]?.queueName || ""}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{column2[index]?.count || ""}</TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Dialog>
    </>
  )
}

export default DashboardInfoQueueModal;
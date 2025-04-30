// DashboardTicketsHappeningsNotContinued
import React, { useState, useEffect } from "react";
import { 
  Badge,
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableRow, 
  Tooltip
} from "@material-ui/core";
import { Close, Visibility } from "@material-ui/icons";
import { useTheme, useMediaQuery } from '@mui/material';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'react-toastify';
import api from "../../services/api";
import { blue } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import TicketMessagesDialogOnly from "../TicketMessagesDialogOnly";


const DashboardTicketsHappeningsNotContinued = ({
  open,
  onClose,
  data
}) => {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const [ticketsData, setTicketsData] = useState([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const rowsPerPage = 9;
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [ticketModal, setTicketModal] = useState('');

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") {
      return;
    }
    onClose();
  };

  useEffect(() => {
    setCount(0)
    setTicketsData([])

    const fetchTickets = async () => {
      if (!data.companyId) return;
  
      const params = {
        companyId: data.companyId,
        finalDate: format(new Date(), 'yyyy-MM-dd'),
      };
  
      try {
        const { data } = await api.request({
          url: `/dashboard/ticketsHappeningsNotContinued`,
          method: 'GET',
          params: params,
        });
  
        setTicketsData(data.data);
        setCount(data.data.length);
      } catch (error) {
        toast.error('Erro ao buscar informações dos tickets');
      }
    };
  
    fetchTickets();
  }, [open]);

  const paginatedData = ticketsData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xl" scroll="paper">
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <DialogTitle style={isMobile ? { paddingRight: 0 } : {}}>
            <Badge 
              badgeContent={count} 
              color="primary"
              max={999}
              sx={{
                '& .MuiBadge-anchorOriginTopRightRectangle': {
                  right: '-1.5rem !important',
                },
              }}
            >
              <span>{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.title")}</span>
            </Badge>
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 10,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Paper
          variant="outlined"
          style={{
            marginInline: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            //minWidth: '1300px',
            overflow: 'hidden',
          }}
        >
          {!ticketsData || ticketsData.length === 0 ? <CircularProgress style={{color:"#d3d3d3"}} /> :
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.serviceColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.attendantColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.contactColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.numberColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.queueColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.idleTimeColumn")}</TableCell>
                      <TableCell align="center">{i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.lastConversationDateColumn")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ticketsData ? paginatedData.map((ticket, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" style={{paddingInline: '0px'}}>
                          <Tooltip title={i18n.t("dashboard.ticketsHappeningsNotContinuedModal.tooltipTitle")}>
                            <Visibility
                              onClick={() => {
                                setOpenTicketMessageDialog(true)
                                setTicketModal(ticket.ticketId)
                              }}
                              fontSize="small"
                              style={{
                                color: blue[700],
                                cursor: "pointer",
                                marginLeft: 10,
                                verticalAlign: "middle"
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{ticket.ticketId}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{ticket.attendant}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{ticket.contact}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{ticket.contactNumber}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              padding: '8px 16px',
                              backgroundColor: ticket.queueColor || '#d3d3d385',
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: ticket.queueColor ? 'white' : 'black',
                            }}
                          >
                            {ticket.queueName}
                          </Box>
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            whiteSpace: "nowrap", 
                            display: "inline-block" 
                          }}
                        >
                          {`${differenceInMinutes(new Date(), new Date(ticket.updatedAt))} ${i18n.t("dashboard.ticketsHappeningsNotContinuedModal.table.idleTimeColumnComplement")}`}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{format(new Date(ticket.lastDate), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                      </TableRow>
                    )) : null }
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box display="flex" justifyContent="center" padding="16px">
                          <Button
                            variant="outlined"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                          >
                            {i18n.t("dashboard.ticketsHappeningsNotContinuedModal.pagination.buttons.previous")}
                          </Button>
                          <Box paddingX="16px" display="flex" alignItems="center">
                            {i18n.t("dashboard.ticketsHappeningsNotContinuedModal.pagination.info")} {currentPage + 1} de {Math.ceil(ticketsData.length / rowsPerPage)}
                          </Box>
                          <Button
                            variant="outlined"
                            disabled={currentPage === Math.ceil(ticketsData.length / rowsPerPage) - 1}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(ticketsData.length / rowsPerPage) - 1))}
                          >
                            {i18n.t("dashboard.ticketsHappeningsNotContinuedModal.pagination.buttons.next")}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
                <TicketMessagesDialogOnly
                  open={openTicketMessageDialog}
                  handleClose={() => setOpenTicketMessageDialog(false)}
                  ticketId={ticketModal}
                >
                </TicketMessagesDialogOnly>
              </Box>
            </>
          }
        </Paper>
      </Dialog>
    </>
  )
}

export default DashboardTicketsHappeningsNotContinued;
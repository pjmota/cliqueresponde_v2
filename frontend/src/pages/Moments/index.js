import React, { useContext, useState, useEffect } from "react";
import MomentsUser from "../../components/MomentsUser";
// import MomentsQueues from "../../components/MomentsQueues";

import MainHeader from "../../components/MainHeader";
import { 
  Box,
  CircularProgress, 
  Container, 
  Grid, 
  Paper, 
  Tab,
  Tabs,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography 
} from "@material-ui/core";
import Title from "../../components/Title";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";
import { isEmpty } from "lodash";
import moment from "moment";
import { toast } from "react-toastify";
import useDashboard from "../../hooks/useDashboard";
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import api from "../../services/api";
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { TabPanel, TabContext } from '@material-ui/lab';
import {
  Call,
  HourglassEmpty,
  CheckCircle,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: "5px",
    maxWidth: "100%"
  },
  mainPaper: {
    display: "flex",
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    alignItems: "center"
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  chatPapper: {
    display: "flex",
    height: "100%",
  },
  contactsHeader: {
    display: "flex",
    flexWrap: "wrap",
    padding: "0px 6px 6px 6px",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  card1: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#11bf42",
    color: "#eee",
  },
  card2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#748e9d",
    color: "#eee",
  },
  card3: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#e53935",
    color: "#eee",
  }
}));

const ChatMoments = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext)
  const [counters, setCounters] = useState({});
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [ticketsData, setTicketsData] = useState([]);
  const [activeTab, setActiveTab] = useState('0');


  async function fetchData() {
    setLoading(true);
  
    let params = {};
  
    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params.date_from = moment(dateFrom).format("YYYY-MM-DD");
    }
  
    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params.date_to = moment(dateTo).format("YYYY-MM-DD");
    }
  
    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }
  
    try {
      const data = await find(params);
      const notContinued = await api.get(`/dashboard/ticketsHappeningsNotContinued`, {
        params: {
          companyId: user.companyId,
          finalDate: format(new Date(), "yyyy-MM-dd"),
        },
      })

      setFullData(data);
      setCounters(data.counters);
      setTicketsData(notContinued.data.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }
  
  // Atualiza os dados ao renderizar
  useEffect(() => {
    console.log('primeira vez')
    fetchData(); // Primeira chamada imediata
  
    const interval = setInterval(() => {
      console.log('mais uma vez')
      fetchData();
    }, 10 * 60 * 1000); 
  
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, [dateFrom, dateTo]);
  
  // Alterna entre as tabs automaticamente a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prevTab) => {
        const tabs = ["0", "1", "2"];
        if (prevTab === "0" && ticketsData.length > 0) {
          return "1"; // Prioriza aba "1"
        }
        const currentIndex = tabs.indexOf(prevTab);
        const nextIndex = (currentIndex + 1) % tabs.length; // Ciclo: 0 -> 1 -> 2 -> 0
        return tabs[nextIndex];
      });
    }, 20000);
  
    return () => clearInterval(interval);
  }, [ticketsData]);
  
  const handleChangeTab = (event, newValue) => {
    setActiveTab(String(newValue));
  };
console.log('fulldata', fullData)
  return (
    user.profile === "user" && user.allowRealTime === "disabled" ?
      <ForbiddenPage />
      :
      <>
        <Container maxWidth="lg" className={classes.container} style={{paddingTop: 0}}>
          <TabContext value={String(activeTab)}>
            <Grid xs={12} sm={8} xl={4} item style={{marginTop: "1.5rem", justifyItems: "center"}}>
              <Title>{"Painel de Atendimentos"}</Title>
            </Grid>
            <Tabs value={Number(activeTab)} onChange={handleChangeTab}>
              <Tab label="" />
              <Tab label="" />
            </Tabs>
            {activeTab === '0' && (
              <>
                <TabPanel value={String(activeTab)} index={0} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                  <Grid container spacing={3} justifyContent="flex-end">
                    {/* EM ATENDIMENTO */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Paper
                          className={classes.card1}
                          style={{ overflow: "hidden" }}
                          elevation={4}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={8}>
                              <Typography
                                component="h3"
                                variant="h6"
                                paragraph
                              >
                                Em Conversa
                              </Typography>
                              <Grid item>
                                <Typography
                                  component="h1"
                                  variant="h4"
                                >
                                  {counters.supportHappening === undefined ? <CircularProgress style={{color:"#d3d3d3"}}/> :
                                    <>
                                      <span style={{marginRight: "0.5rem"}}>
                                        {counters.supportHappening}
                                      </span>
                                    </> 
                                  }
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid item xs={2}>
                              <Call
                                style={{
                                  fontSize: 100,
                                  color: "#0b708c",
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                      { fullData?.countQueuesHappening?.length > 0 ? 
                      <>
                        <Box sx={{ paddingTop: "0.5rem" }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">Fila</TableCell>
                                  <TableCell align="center">Qt. atendimentos</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                { fullData.countQueuesHappening.slice(0, 10).map((queue, index) => (
                                  <TableRow key={index}>
                                    <TableCell align="center">
                                      <Box
                                        sx={{
                                          display: 'inline-block',
                                          padding: '4px 12px',
                                          backgroundColor: queue?.color || '#d3d3d385',
                                          borderRadius: '4px',
                                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                          fontWeight: 'bold',
                                          textAlign: 'center',
                                          color: queue?.color ? 'white' : 'black',
                                        }}
                                      >
                                        {queue?.queueName || ""}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      {queue?.count || ""}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </> : null}
                    </Grid>

                    {/* AGUARDANDO */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Paper
                          className={classes.card2}
                          style={{ overflow: "hidden" }}
                          elevation={6}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={8}>
                              <Typography
                                component="h3"
                                variant="h6"
                                paragraph
                              >
                                Aguardando
                              </Typography>
                              <Grid item>
                                <Typography
                                  component="h1"
                                  variant="h4"
                                >
                                  {counters.supportPending  === undefined ? <CircularProgress style={{color:"#d3d3d3"}}/> :
                                    <>
                                      <span style={{marginRight: "0.5rem"}}>
                                        {counters.supportPending}
                                      </span>
                                    </> 
                                  }
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid item xs={4}>
                              <HourglassEmpty
                                style={{
                                  fontSize: 100,
                                  color: "#47606e",
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                      { fullData?.countQueuesPending?.length > 0 ? 
                      <>
                        <Box sx={{ paddingTop: "0.5rem" }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">Fila</TableCell>
                                  <TableCell align="center">Qt. atendimentos</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                { fullData.countQueuesPending.slice(0, 10).map((queue, index) => (
                                  <TableRow key={index}>
                                    <TableCell align="center">
                                      <Box
                                        sx={{
                                          display: 'inline-block',
                                          padding: '4px 12px',
                                          backgroundColor: queue?.color || '#d3d3d385',
                                          borderRadius: '4px',
                                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                          fontWeight: 'bold',
                                          textAlign: 'center',
                                          color: queue?.color ? 'white' : 'black',
                                        }}
                                      >
                                        {queue?.queueName || ""}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      {queue?.count || ""}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </> : null}
                    </Grid>

                    {/* FINALIZADOS */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Paper
                          className={classes.card3}
                          style={{ overflow: "hidden" }}
                          elevation={6}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={8}>
                              <Typography
                                component="h3"
                                variant="h6"
                                paragraph
                              >
                                Finalizados
                              </Typography>
                              <Grid item>
                                <Typography
                                  component="h1"
                                  variant="h4"
                                >
                                  {counters.supportFinished  === undefined ? <CircularProgress style={{color:"#d3d3d3"}}/> :
                                    <>
                                      <span style={{marginRight: "0.5rem"}}>
                                        {counters.supportFinished}
                                      </span>
                                    </> 
                                  }
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid item xs={4}>
                              <CheckCircle
                                style={{
                                  fontSize: 100,
                                  color: "#5852ab",
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                      { fullData?.countQueuesFinished?.length > 0 ? 
                      <>
                        <Box sx={{ paddingTop: "0.5rem" }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">Fila</TableCell>
                                  <TableCell align="center">Qt. atendimentos</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                { fullData.countQueuesFinished.slice(0, 10).map((queue, index) => (
                                  <TableRow key={index}>
                                    <TableCell align="center">
                                      <Box
                                        sx={{
                                          display: 'inline-block',
                                          padding: '4px 12px',
                                          backgroundColor: queue?.color || '#d3d3d385',
                                          borderRadius: '4px',
                                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                          fontWeight: 'bold',
                                          textAlign: 'center',
                                          color: queue?.color ? 'white' : 'black',
                                        }}
                                      >
                                        {queue?.queueName || ""}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      {queue?.count || ""}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </> : null}
                    </Grid>
                  </Grid>
                </TabPanel>
              </>
            )}
            {activeTab === '1' && (
              <TabPanel value={String(activeTab)} index={0} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                <MainHeader>
                  <Grid style={{ width: "99.6%" }} container justifyContent="center" alignItems="flex-start">
                    {/* <Grid xs={12} sm={8} xl={4} item style={{marginTop: "1.5rem", justifyItems: "center"}}>
                      <Title>{"Painel de Atendimentos"}</Title>
                    </Grid> */}
                    <Grid style={{ width: "100%", height: "100vh" }} item>
                      <Paper
                        className={classes.mainPaper}
                        variant="outlined"
                        style={{ maxWidth: "100%" }}
                      >
                        <MomentsUser />
                      </Paper>
                    </Grid>
                  </Grid>
                </MainHeader>
              </TabPanel>
            )}
            {activeTab === '2' && (
              <>
                <TabPanel value={String(activeTab)} index={1} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                  <Box sx={{marginTop: "0"}}>
                    { ticketsData.length > 0 && (
                    <>
                      <Box sx={{borderTop: '1px solid #e0e0e0'}}></Box>
                      <TableContainer>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">Atendimento</TableCell>
                              <TableCell align="center">Atendente</TableCell>
                              <TableCell align="center">Contato</TableCell>
                              <TableCell align="center">Numero</TableCell>
                              <TableCell align="center">Fila</TableCell>
                              <TableCell align="center">Tempo Ocioso</TableCell>
                              <TableCell align="center">Data última conversa</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {ticketsData.length > 0 ? ticketsData.slice(0, 10).map((ticket, index) => (
                              <TableRow key={index}>
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
                                <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{`${differenceInMinutes(new Date(), new Date(ticket.updatedAt))} minutos atrás`}</TableCell>
                                <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "inline-block" }}>{format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                              </TableRow>
                            )) : null }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                    )}
                  </Box>
                </TabPanel>
              </>
            )}
          </TabContext>
        </Container>
      </>
  );
};

export default ChatMoments;

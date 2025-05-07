import React, { useEffect, useReducer, useState } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import MainContainer from "../../components/MainContainer";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  makeStyles,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import AfterSalesStatusSelect from "../../components/AfterSalesStatusSelect";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import SearchIcon from "@material-ui/icons/Search";
import FindInPageIcon from "@material-ui/icons/FindInPage";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import AfterSalesModal from "../../components/AfterSalesModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { isArray } from "lodash";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    width: "100%",
    maxWidth: "auto",
    ...theme.scrollbarStyles,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_AFTER_SALES") {
    const afterSales = action.payload;
    const newAfterSales = [];

    if (isArray(afterSales)) {
      afterSales.forEach((afterSales) => {
        const afterSalesIndex = state.findIndex((u) => u.id === afterSales.id);
        if (afterSalesIndex !== -1) {
          state[afterSalesIndex] = afterSales;
        } else {
          newAfterSales.push(afterSales);
        }
      });
    }

    return [...state, ...newAfterSales];
  }

  if (action.type === "UPDATE_AFTER_SALES") {
    const afterSales = action.payload;
    const afterSalesIndex = state.findIndex((u) => u.id === afterSales.id);

    if (afterSalesIndex !== -1) {
      state[afterSalesIndex] = afterSales;
      return [...state];
    } else {
      return [afterSales, ...state];
    }
  }

  if (action.type === "DELETE_AFTER_SALES") {
    const afterSalesId = action.payload;

    const afterSalesIndex = state.findIndex((u) => u.id === afterSalesId);
    if (afterSalesIndex !== -1) {
      state.splice(afterSalesIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const AfterSalesDetailsModal = ({ afterSales, open, handleClose }) => {
  const [detail, setDetail] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }
  
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/aftersales/${afterSales.id}/details`);
        setDetail(data);
      } catch (error) {
        // Opcional: Tratar o erro, ex.: exibir uma mensagem
        console.error("Erro ao buscar detalhes:", error);
      }
    };
  
    fetchDetails();
  }, [open]);

  const isImage = (item) => item.name.toLowerCase().startsWith("img");

  const handleClipBoard = (value) => {
    navigator.clipboard.writeText(value);
    toast.success("Copiado para a área de transferência.");
  };

  const maskLabel = (value) => {
    const m = value.match(/CMB\s{1,}(.*)\[(.*)\]/i);
    return m ? m[1] : value;
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">Dados adicionais</DialogTitle>
        <DialogContent>
          <Box style={{ paddingLeft: "4px", paddingRight: "4px" }}>
            {afterSales && (
              <table>
                <tbody>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.contact.name)}
                  >
                    <th>Nome:</th>
                    <td>{afterSales.contact.name}</td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.contact.number)}
                  >
                    <th>Número:</th>
                    <td>{afterSales.contact.number}</td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.sellerName)}
                  >
                    <th>Atendente:</th>
                    <td>{afterSales.sellerName}</td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.sector)}
                  >
                    <th>Setor:</th>
                    <td>{afterSales.sector}</td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.updatedAt)}
                  >
                    <th>Data de cadastro:</th>
                    <td>
                      {afterSales.updatedAt &&
                        format(
                          parseISO(afterSales.updatedAt),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                    </td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.status)}
                  >
                    <th>Status:</th>
                    <td>{afterSales.status}</td>
                  </tr>
                  <tr
                    style={{ textAlign: "left" }}
                    onClick={() => handleClipBoard(afterSales.OBSPOSVENDA)}
                  >
                    <th>OBSPOSVENDA:</th>
                    <td>{afterSales.OBSPOSVENDA}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </Box>
          <List>
            {detail
              .filter((item) => !isImage(item) && item.value)
              .map((item, index) => (
                <ListItem
                  key={index}
                  onClick={() => handleClipBoard(item.value)}
                >
                  <strong>{maskLabel(item.name)}</strong>:&nbsp;{item.value}
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("Cancelar")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const AfterSales = () => {
  const classes = useStyles();

  const [afterSaleId, setAfterSaleId] = useState();
  const [open, setOpen] = useState(false);
  const [afterSales, setAfterSales] = useState();
  const [searchParam, setSearchParam] = useState("");
  const [deletingAfterSales, setDeletingAfterSales] = useState(null);
  const [dateStart, setDateStart] = useState();
  const [dateEnd, setDateEnd] = useState();
  const [status, setStatus] = useState(["POS_VENDA_PENDENTE"]);
  const [total, setTotal] = useState(0);
  const [afterSalesModalOpen, setAfterSalesModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAfterSales();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber, dateStart, dateEnd, status]);

  const fetchAfterSales = async () => {
    try {
      const { data } = await api.get("/aftersales", {
        params: {
          searchParam,
          pageNumber,
          dateStart,
          dateEnd,
          status: JSON.stringify(status),
        },
      });

      dispatch({ type: "LOAD_AFTER_SALES", payload: data.afterSales });
      setHasMore(data.hasMore);
      setLoading(false);
      setTotal(data.count);
    } catch (error) {}
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setAfterSales(null);
  };

  const handleOpen = (item) => {
    setOpen(true);
    setAfterSales(item);
  };

  const handlePatchStatus = async (id, status) => {
    try {
      await api.put(`/aftersales/${id}`, { status });
      dispatch({ type: "RESET" });
      await fetchAfterSales();
    } catch (error) {
      toastError("Falha ao atualizar o status");
    }
  };

  const handleOpenFiles = (item) => {
    window.open(`/aftersales/${item.id}/files`, "_blank");
  };

  const handleOpenAfterSalesModal = () => {
    setAfterSalesModalOpen(true);
  };

  const handleCloseAfterSalesModal = async () => {
    setAfterSalesModalOpen(false);
    setAfterSaleId(null);
    await fetchAfterSales();
  };

  const handleEditAfterSales = (id) => {
    setAfterSalesModalOpen(true);
    setAfterSaleId(id);
  };

  const handleDeleteAfterSales = async (item) => {
    try {
      await api.delete(`/aftersales/${item.id}`);
      dispatch({ type: "DELETE_AFTER_SALES", payload: item.id });
      toast.success(i18n.t("Pós-venda excluído"));
    } catch (err) {
      toastError(err);
    }
    setDeletingAfterSales(null);
    setSearchParam("");
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <AfterSalesDetailsModal
        open={open}
        afterSales={afterSales}
        handleClose={handleClose}
      />
      <AfterSalesModal
        open={afterSalesModalOpen}
        afterSaleId={afterSaleId}
        onClose={handleCloseAfterSalesModal}
      ></AfterSalesModal>
      <ConfirmationModal
        title={
          deletingAfterSales &&
          `${i18n.t("announcements.confirmationModal.deleteTitle")} ${
            deletingAfterSales.contact.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteAfterSales(deletingAfterSales)}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Title>Pós-Venda</Title>
        <MainHeaderButtonsWrapper>
          <Grid
            container
            spacing={4}
            alignItems="flex-end"
            style={{ width: "99.6%" }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAfterSalesModal}
              >
                {i18n.t("Adicionar pós-venda")}
              </Button>
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                onChange={(ev) => setSearchParam(ev.target.value)}
                sx={{ width: "200px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item>
              <TextField
                fullWidth
                name="dateStart"
                label="De"
                InputLabelProps={{
                  shrink: true,
                }}
                type="date"
                onChange={(ev) => setDateStart(ev.target.value)}
              />
            </Grid>

            <Grid item>
              <TextField
                fullWidth
                name="dateEnd"
                label="Até"
                InputLabelProps={{
                  shrink: true,
                }}
                type="date"
                onChange={(ev) => setDateEnd(ev.target.value)}
              />
            </Grid>

            <Grid item>
              <AfterSalesStatusSelect
                showAllOption={true}
                multiple={true}
                selectedAfterSalesStatusIds={status}
                onChange={(status) => setStatus(status)}
              />
            </Grid>
          </Grid>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <div style={{ textAlign: "right" }}>
          Quantidade de registros: <strong>{total}</strong>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Número</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Atendente</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Data de cadastro</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>OBSPOSVENDA</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.contact.number}</TableCell>
                <TableCell>{item.contact.name}</TableCell>
                <TableCell>{item.sellerName}</TableCell>
                <TableCell>{item.sellerSector}</TableCell>
                <TableCell>
                  {format(parseISO(item.updatedAt), "dd/MM/yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <AfterSalesStatusSelect
                    multiple={false}
                    selectedAfterSalesStatusIds={item.status}
                    showAllOption={false}
                    onChange={(status) => handlePatchStatus(item.id, status)}
                  />
                </TableCell>
                <TableCell>{item.OBSPOSVENDA}</TableCell>
                <TableCell>
                  <Grid container>
                    <Grid item>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAfterSales(item.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Grid>
                    {item.filledAfterSalesFiles != 0 && (
                      <Grid item>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(item)}
                        >
                          <FindInPageIcon />
                        </IconButton>
                      </Grid>
                    )}
                    {item.images != 0 && (
                      <Grid item>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenFiles(item)}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Grid>
                    )}
                    <Grid item>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingAfterSales(item);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={10} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default AfterSales;
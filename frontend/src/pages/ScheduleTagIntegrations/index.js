import React, { useEffect, useReducer, useState } from "react";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";

import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import ScheduleTagIntegrationsModal from "../../components/ScheduleTagIntegrationsModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Adicione um estilo para a box vermelha
  redBox: {
    backgroundColor: "#ffcccc", // Definindo a cor de fundo vermelha
    padding: theme.spacing(2), // Adicionando um espaçamento interno
    marginBottom: theme.spacing(2), // Adicionando margem inferior para separar do conteúdo abaixo
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const data = action.payload;
    const news = [];

    data.forEach((item) => {
      const index = state.findIndex((p) => p.id === item.id);
      if (index !== -1) {
        state[index] = item;
      } else {
        news.push(item);
      }
    });

    return [...state, ...news];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const item = action.payload;
    const index = state.findIndex((p) => p.id === item.id);

    if (index !== -1) {
      state[index] = item;
      return [...state];
    } else {
      return [item, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const id = action.payload;
    const index = state.findIndex((p) => p.id === id);
    if (index !== -1) {
      state.splice(index, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const ScheduleTagIntegrations = () => {
  const classes = useStyles();

  const [data, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/scheduleTagIntegration");
      dispatch({ type: "LOAD_PROMPTS", payload: data.rows });

      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
    setSelected(null);
  };

  const handleCloseModal = async () => {
    setModalOpen(false);
    setSelected(null);
    await fetchData();
  };

  const handleEdit = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/scheduleTagIntegration/${id}`);
      toast.info(i18n.t(data.message));
      dispatch({ type: "DELETE_PROMPT", payload: id });
    } catch (err) {
      toastError(err);
    }
    setSelected(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selected &&
          `${i18n.t("Deletar automação para a tag")} "${selected.tag?.name}"?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDelete(selected.id)}
      >
        {i18n.t("Esta ação não poderá ser desfeita")}
      </ConfirmationModal>
      <ScheduleTagIntegrationsModal
        open={modalOpen}
        onClose={handleCloseModal}
        id={selected?.id}
      />
      <MainHeader>
        <Title>{i18n.t("Automação de integrações")}</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            {i18n.t("Adicionar")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">{i18n.t("Tag")}</TableCell>
              <TableCell align="left">{i18n.t("Próxima tag")}</TableCell>
              <TableCell align="left">{i18n.t("Integração")}</TableCell>
              <TableCell align="left">{i18n.t("Delay")}</TableCell>
              <TableCell align="center">{i18n.t("Ações")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell align="left">{item.tag?.name}</TableCell>
                  <TableCell align="left">{item.nextTag?.name}</TableCell>
                  <TableCell align="left">
                    {item.queueIntegration?.name}
                  </TableCell>
                  <TableCell align="left">{item.delay}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(item)}>
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelected(item);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ScheduleTagIntegrations;
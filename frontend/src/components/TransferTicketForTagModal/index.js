import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    padding: theme.spacing(1),
    // Removido theme.scrollbarStyles para evitar conflitos
  },
  scrollContainer: {
    maxHeight: "370px", // Reduzido para forçar o scroll com 10 itens
    overflowY: "auto",
    display: "block",
  },
  noScroll: {
    maxHeight: "auto",
    overflowY: "visible",
  },
  dialogContent: {
    maxHeight: "500px", // Limita a altura do DialogContent
    overflowY: "auto",
  },
  boxTag: {
    marginTop: "1rem",
  },
}));

const TransferTicketForTagModal = ({
  title,
  paramData,
  open,
  onClose,
  kanban,
}) => {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [nextTag, setNextTag] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    getTag();
  }, []);

  const getTag = async () => {
    const { data } = await api.get(`/tags/list`, {
      params: { kanban: kanban },
    });
    const filteredData = data.filter((tag) => tag.id !== paramData.id);
    setTags(filteredData);
  };

  const handleChange = (event) => {
    setCurrentTag(event.target.value);
  };

  const onValidateConfirm = () => {
    const next = tags.find((e) => e.id === Number(currentTag));
    setConfirmationOpen(true);
    setNextTag(next);
  };

  const onConfirm = async () => {
    const ticketsChanged = await api.put(`/tags/kanban/${nextTag.id}`, {
      paramsId: paramData.data.map((e) => kanban === 1 ? e.ticketId : e.contactId).join(","),
      currentTag: paramData.id,
      screenInfo: kanban,
    });

    if (ticketsChanged.status === 200) {
      toast.success(ticketsChanged.data.message);
      onClose(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => onClose(false)}
        aria-labelledby="confirm-dialog"
      >
        <DialogTitle id="confirm-dialog">{title}</DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          <Paper className={classes.mainPaper} variant="outlined">
            <div
              className={
                paramData.data.length > 10
                  ? classes.scrollContainer
                  : classes.noScroll
              }
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      {kanban === 1
                        ? i18n.t(
                            "tagsKanban.transferTicketforTagModal.table.ticketId"
                          )
                        : i18n.t(
                            "tagsKanban.transferTicketforTagModal.table.contactId"
                          )}
                    </TableCell>
                    <TableCell align="center">
                      {i18n.t(
                        "tagsKanban.transferTicketforTagModal.table.tagId"
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paramData.data.map((ticket) => (
                    <TableRow key={ticket.ticketId}>
                      <TableCell align="center">
                        {ticket.ticketId ? ticket.ticketId : ticket.contactId}
                      </TableCell>
                      <TableCell align="center">{ticket.tagId ? ticket.tagId : 'Sem tag definida'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Paper>
          <Box className={classes.boxTag}>
            <TextField
              id="outlined"
              label={i18n.t(
                "tagsKanban.transferTicketforTagModal.label.currentTag"
              )}
              value={paramData.name}
              style={{ marginRight: "10px" }}
            />
            <TextField
              id="outlined"
              select
              label={i18n.t(
                "tagsKanban.transferTicketforTagModal.label.nextTag"
              )}
              variant="standard"
              style={{
                marginLeft: "10px",
                width: "15rem",
              }}
              value={currentTag}
              onChange={handleChange}
            >
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => onClose(false)}
            color="default"
          >
            {i18n.t("confirmationModal.buttons.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onValidateConfirm();
            }}
            color="secondary"
            disabled={!currentTag}
          >
            {i18n.t("confirmationModal.buttons.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationModal
        title={`${
          kanban === 1
            ? i18n.t(
                "tagsKanban.transferTicketforTagModal.confirmationModal.titleLane"
              )
            : i18n.t(
                "tagsKanban.transferTicketforTagModal.confirmationModal.titleTag"
              )
        } ${nextTag.name}`}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={onConfirm}
      >
        {`${i18n.t(
          "tagsKanban.transferTicketforTagModal.confirmationModal.message"
        )}`}
      </ConfirmationModal>
    </>
  );
};

export default TransferTicketForTagModal;

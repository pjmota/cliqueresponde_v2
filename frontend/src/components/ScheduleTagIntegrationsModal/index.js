import React, { useState, useEffect } from "react";

import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import TagSelect from "../TagSelect";
import QueueIntegrationSelect from "../QueueIntegrationSelect";
import WhatsAppSelect from "../WhatsAppSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

const ScheduleTagIntegrationsModal = ({ open, onClose, id }) => {
  const classes = useStyles();

  const initialState = {
    tagId: null,
    nextTagId: null,
    queueIntegrationId: null,
    delay: 5,
    whatsappIds: [],
  };

  const [scheduleTagIntegrations, setScheduleTagIntegrations] = useState(initialState);

  const fetchScheduleTagIntegration = async () => {
    if (!id) {
      setScheduleTagIntegrations(initialState);
      return;
    }
    try {
      const { data } = await api.get(`/scheduleTagIntegration/${id}`);
      setScheduleTagIntegrations((prevState) => {
        return {
          ...prevState,
          ...data,
          whatsappIds: data.whatsapps?.map((item) => item.id),
        };
      });
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    fetchScheduleTagIntegration();
  }, [id, open]);

  const handleClose = () => {
    setScheduleTagIntegrations(initialState);
    onClose();
  };

  const handleSaveScheduleTagIntegration = async (values) => {
    const data = { ...values };
    try {
      if (id) {
        await api.put(`/scheduleTagIntegration/${id}`, data);
      } else {
        await api.post("/scheduleTagIntegration", data);
      }
      toast.success(i18n.t("promptModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        scroll="paper"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">
          {id
            ? `${i18n.t("Editar automação")}`
            : `${i18n.t("Adicionar automação")}`}
        </DialogTitle>
        <Formik
          initialValues={scheduleTagIntegrations}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveScheduleTagIntegration(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <TagSelect
                  multiple={false}
                  selectedTagIds={scheduleTagIntegrations.tagId}
                  onChange={(id) =>
                    setScheduleTagIntegrations({
                      ...scheduleTagIntegrations,
                      tagId: id,
                    })
                  }
                  kanbam={1}
                />
                <TagSelect
                  multiple={false}
                  selectedTagIds={scheduleTagIntegrations.nextTagId}
                  title={"Próxima tag"}
                  onChange={(id) =>
                    setScheduleTagIntegrations({
                      ...scheduleTagIntegrations,
                      nextTagId: id,
                    })
                  }
                  kanbam={1}
                />
                <QueueIntegrationSelect
                  multiple={false}
                  title={"Integrações"}
                  selectedQueueIntegrationIds={
                    scheduleTagIntegrations.queueIntegrationId
                  }
                  onChange={(id) =>
                    setScheduleTagIntegrations({
                      ...scheduleTagIntegrations,
                      queueIntegrationId: id,
                    })
                  }
                />
                <WhatsAppSelect
                  selectedWhatsappIds={scheduleTagIntegrations.whatsappIds}
                  onChange={(id) =>
                    setScheduleTagIntegrations({
                      ...scheduleTagIntegrations,
                      whatsappIds: id,
                    })
                  }
                />
                <Field
                  as={TextField}
                  label={i18n.t("Delay")}
                  name="delay"
                  min="5"
                  type="number"
                  step="5"
                  value={scheduleTagIntegrations.delay}
                  onChange={(ev) =>
                    setScheduleTagIntegrations({
                      ...scheduleTagIntegrations,
                      delay: ev.target.value,
                    })
                  }
                  error={touched.delay && Boolean(errors.delay)}
                  helperText={touched.delay && errors.delay}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {id
                    ? `${i18n.t("promptModal.buttons.okEdit")}`
                    : `${i18n.t("promptModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ScheduleTagIntegrationsModal;

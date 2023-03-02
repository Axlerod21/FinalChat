import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Messages from "./Messages";
import IconButton from "@material-ui/core/IconButton";
import { useParams } from "react-router-dom";
import { db } from "../Firebase/Firebase";
import firebase from "firebase/compat/app";
import ScrollableFeed from "react-scrollable-feed";
import { BiHash } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { GrEmoji } from "react-icons/gr";
import { Picker } from "emoji-mart";
import { RiImageAddLine } from "react-icons/ri";
import FileUpload from "./FileUpload";
import Icon from "@mdi/react";
import { mdiMapMarker, mdiWeatherCloudy } from "@mdi/js";
import "emoji-mart/css/emoji-mart.css";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";

let api = "https://api.openweathermap.org/data/2.5/weather";
const apiKey = "347dfea5c70fe19b9979bd78df91a1fd";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  chat: {
    position: "relative",
    height: "calc(100vh - 200px)",
    paddingLeft: "10px",
    paddingBottom: "5px",
    paddingTop: "5px",
  },
  footer: {
    paddingRight: "15px",
    paddingLeft: "15px",
    paddingTop: "10px",
  },
  message: {
    width: "100%",
    color: "white",
  },
  roomName: {
    border: "1px solid #0000004a",
    borderLeft: 0,
    borderRight: 0,
    padding: "15px",
    display: "flex",
    color: "#e5e5e5",
  },
  roomNameText: {
    marginBlockEnd: 0,
    marginBlockStart: 0,
    paddingLeft: "5px",
  },
  iconDesign: {
    fontSize: "1.5em",
    color: "#e5e5e5",
  },
  footerContent: {
    display: "flex",
    backgroundColor: "#303753",
    borderRadius: "5px",
    alignItems: "center",
  },
  inputFile: {
    display: "none",
  },
}));

function Chat() {
  const classes = useStyles();
  const params = useParams();
  const [allMessages, setAllMessages] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [userNewMsg, setUserNewMsg] = useState("");
  const [emojiBtn, setEmojiBtn] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [file, setFileName] = useState(null);

  useEffect(() => {
    if (params.id) {
      db.collection("channels")
        .doc(params.id)
        .onSnapshot((snapshot) => {
          setChannelName(snapshot.data().channelName);
        });

      db.collection("channels")
        .doc(params.id)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          setAllMessages(
            snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
          );
        });
    }
  }, [params]);

  const sendMsg = (e) => {
    e.preventDefault();

    if (userNewMsg && params.id) {
      const userData = JSON.parse(localStorage.getItem("userDetails"));

      if (userData) {
        const displayName = userData.displayName;
        const imgUrl = userData.photoURL;
        const uid = userData.uid;
        const likeCount = 0;
        const likes = {};
        const fireCount = 0;
        const fire = {};
        const heartCount = 0;
        const heart = {};
        const postImg = null;
        const obj = {
          text: userNewMsg,
          timestamp: firebase.firestore.Timestamp.now(),
          userImg: imgUrl,
          userName: displayName,
          uid: uid,
          likeCount: likeCount,
          likes: likes,
          fireCount: fireCount,
          fire: fire,
          heartCount: heartCount,
          heart: heart,
          postImg: postImg,
        };

        db.collection("channels")
          .doc(params.id)
          .collection("messages")
          .add(obj)
          .then((res) => {
            console.log("message sent");
          })
          .catch((err) => {
            console.log(err);
          });
      }

      setUserNewMsg("");
      setEmojiBtn(false);
    }
  };

  const addEmoji = (e) => {
    setUserNewMsg(userNewMsg + e.native);
  };

  const openModal = () => {
    setModalState(!modalState);
  };

  const handelFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setFileName(e.target.files[0]);
      openModal();
    }
    e.target.value = null;
  };

  const sendLocation = () => {
    let latitude, longitude;
    const successCallback = (position) => {
      console.log(position);
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBaX6Agf_m6bK1liOjC1sEtgtx37bt1Jkk`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setUserNewMsg(`My location: ${data.results[6].formatted_address}`);
        });
    };

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    const options = {
      enableHighAccuracy: true,
    };

    navigator.geolocation.getCurrentPosition(successCallback, error, options);
  };

  const sendWeather = () => {
    let latitude, longitude;

    const successCallback = async (position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      let url =
        api +
        "?lat=" +
        latitude +
        "&lon=" +
        longitude +
        "&appid=" +
        apiKey +
        "&units=metric";

      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          let temp = data.main.temp;
          let area = data.name;
          // temperature.innerHTML = temp + "° F";
          // location.innerHTML =
          //   data.name + " (" + latitude + "°, " + longitude + "°)";
          // description.innerHTML = data.weather[0].main;
          setUserNewMsg(`It is currently ${temp} °C in ${area}`);
        });
    };

    navigator.geolocation.getCurrentPosition(successCallback);
  };

  return (
    <div className={classes.root}>
      {modalState ? <FileUpload setState={openModal} file={file} /> : null}
      <Grid item xs={12} className={classes.roomName}>
        <BiHash className={classes.iconDesign} />
        <h3 className={classes.roomNameText}>{channelName}</h3>
      </Grid>
      <Grid item xs={12} className={classes.chat}>
        <ScrollableFeed>
          {allMessages.map((message) => (
            <Messages
              key={message.id}
              values={message.data}
              msgId={message.id}
            />
          ))}
        </ScrollableFeed>
      </Grid>
      <div className={classes.footer}>
        <Grid item xs={12} className={classes.footerContent}>
          <input
            accept="image/*"
            className={classes.inputFile}
            id="icon-button-file"
            type="file"
            onChange={(e) => handelFileUpload(e)}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <RiImageAddLine style={{ color: "#b9bbbe" }} />
            </IconButton>
          </label>

          <IconButton
            color="primary"
            component="button"
            onClick={() => setEmojiBtn(!emojiBtn)}
          >
            <GrEmoji style={{ color: "#b9bbbe" }} />
          </IconButton>
          {emojiBtn ? <Picker onSelect={addEmoji} theme="dark" /> : null}

          <form
            autoComplete="off"
            style={{ width: "100%", display: "flex" }}
            onSubmit={(e) => sendMsg(e)}
          >
            <TextField
              className={classes.message}
              required
              id="outlined-basic"
              label="Enter Message"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={2}
              value={userNewMsg}
              onChange={(e) => {
                setUserNewMsg(e.target.value);
              }}
            />
            <IconButton type="submit" component="button">
              <FiSend style={{ color: "#b9bbbe" }} />
            </IconButton>
            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{ position: "absolute", bottom: 100, right: 16 }}
              icon={<SpeedDialIcon />}
            >
              <SpeedDialAction
                key="weather"
                sx={{ bgcolor: "lightblue" }}
                icon={<Icon path={mdiWeatherCloudy} />}
                tooltipTitle="Send Weather"
                onClick={sendWeather}
              />
              <SpeedDialAction
                key="location"
                sx={{ bgcolor: "lightblue" }}
                icon={<Icon path={mdiMapMarker} />}
                tooltipTitle="Send Location"
                onClick={sendLocation}
              />
            </SpeedDial>
          </form>
        </Grid>
      </div>
    </div>
  );
}

export default Chat;

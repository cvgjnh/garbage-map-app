import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Modal,
  ActivityIndicator,
  Menu,
  Appbar,
  IconButton,
  Surface,
} from 'react-native-paper';
import React, { useState, useEffect, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import { LogEntry } from './LogEntry';
import { LogDialog } from './LogDialog';
import { ReportDialog } from './ReportDialog';
import { UserContext } from '../UserContext';

const deviceWidth = Dimensions.get('window').width;

export function MarkerModal(props) {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedMarkerLogs, setSelectedMarkerLogs] = useState([]);
  const [moreLogsAvailable, setMoreLogsAvailable] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);

  const openMap = async (latitude, longitude) => {
    const link = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    try {
      const supported = await Linking.canOpenURL(link);

      if (supported) Linking.openURL(link);
    } catch (error) {
      console.log(error);
    }
  };

  // gets the next five logs in descending order of creation date for the selected marker
  const getLogs = async () => {
    let logDocuments;
    if (selectedMarkerLogs.length === 0) {
      logDocuments = await firestore()
        .collection('logs')
        .where('markerId', '==', props.selectedMarker.id)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
    } else {
      logDocuments = await firestore()
        .collection('logs')
        .where('markerId', '==', props.selectedMarker.id)
        .orderBy('createdAt', 'desc')
        .startAfter(selectedMarkerLogs[selectedMarkerLogs.length - 1].createdAt)
        .limit(5)
        .get();
    }
    if (logDocuments.size < 5) {
      setMoreLogsAvailable(false);
    } else {
      setMoreLogsAvailable(true);
    }
    logDocuments.forEach((documentSnapshot) => {
      setSelectedMarkerLogs((prevLogs) => [
        ...prevLogs,
        { ...documentSnapshot.data(), id: documentSnapshot.id },
      ]);
    });
  };

  // if the user selects a different marker, reset the logs and image
  useEffect(() => {
    setSelectedMarkerLogs([]);
    setImageURL(null);
  }, [props.selectedMarker && props.selectedMarker.id]);

  // triggers when the modal is opened
  useEffect(() => {
    if (props.selectedMarker && props.modalVisible) {
      if (imageURL === null) {
        storage()
          .ref(props.selectedMarker.image)
          .getDownloadURL()
          .then((url) => {
            setImageURL(url);
          })
          .catch((error) => {
            console.log('Error getting image URL: ', error);
          });
      }

      if (selectedMarkerLogs.length === 0) {
        getLogs();
      }
    }
  }, [props.modalVisible]);

  // seems that the context isn't being passed into child components of Modal for some reason
  // not sure why but will pass the user as a prop for now
  return (
    <Portal>
      <Modal
        visible={props.modalVisible}
        onDismiss={() => {
          props.setModalVisible(!props.modalVisible);
        }}
        contentContainerStyle={styles.container}
      >
        <LogDialog
          selectedMarker={props.selectedMarker}
          logDialogOpen={logDialogOpen}
          setLogDialogOpen={setLogDialogOpen}
          setSelectedMarkerLogs={setSelectedMarkerLogs}
          user={user}
          setUser={setUser}
        />
        <ReportDialog
          selectedMarker={props.selectedMarker}
          reportDialogOpen={reportDialogOpen}
          setReportDialogOpen={setReportDialogOpen}
          user={user}
        />
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => props.setModalVisible(!props.modalVisible)}
          />
          <Appbar.Content title="View Marker" titleStyle={styles.title} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Surface style={{ flex: 1 }}>
            {imageURL !== null ? (
              <Image source={{ uri: imageURL }} style={styles.imageBox} />
            ) : (
              <ActivityIndicator
                style={{
                  alignSelf: 'center',
                  padding: 10,
                }}
                size="large"
              />
            )}
            <View style={styles.titleRow}>
              <Text variant="headlineSmall">
                {props.selectedMarker && props.selectedMarker.title}
              </Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => {
                  setMenuVisible(false);
                }}
                anchor={
                  <IconButton
                    onPress={() => {
                      setMenuVisible(true);
                    }}
                    icon="dots-vertical"
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setReportDialogOpen(true);
                    setMenuVisible(false);
                  }}
                  title="Report"
                />
              </Menu>
            </View>
            <View style={styles.row}>
              {props.selectedMarker?.isTrash && (
                <Icon name="trash-can" size={24} color="gray" />
              )}
              {props.selectedMarker?.isRefundables && (
                <Icon name="bottle-soda" size={24} color="darkblue" />
              )}
              {props.selectedMarker?.isRecyclables && (
                <Icon name="recycle" size={24} color="#5592b4" />
              )}
              {props.selectedMarker?.isCompost && (
                <Icon name="leaf" size={24} color="green" />
              )}
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                style={{ flex: 1 }}
                onPress={() => {
                  openMap(
                    props.selectedMarker.coordinates.latitude,
                    props.selectedMarker.coordinates.longitude
                  );
                }}
              >
                Directions
              </Button>
              <Button
                mode="contained"
                style={{ flex: 1 }}
                onPress={() => {
                  if (!user) {
                    navigation.navigate('Profile');
                    props.setModalVisible(false);
                    return;
                  }

                  setLogDialogOpen(true);
                }}
              >
                Log
              </Button>
            </View>
            <Text variant="bodyMedium" style={styles.text}>
              {props.selectedMarker && props.selectedMarker.description}
            </Text>

            <Text variant="titleMedium" style={styles.text}>
              Logs
            </Text>

            {selectedMarkerLogs.map((log) => {
              return <LogEntry key={log.id} log={log} />;
            })}
            {moreLogsAvailable && (
              <Button
                onPress={() => {
                  getLogs();
                }}
              >
                Load More
              </Button>
            )}
          </Surface>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    backgroundColor: 'white',
    bottom: 10,
    left: 10,
    right: 10,
    borderWidth: 1,
    zIndex: 100,
    position: 'absolute',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    padding: 10,
  },

  imageBox: {
    // width: '100%',
    // height: undefined,
    // aspectRatio: 1,
    // resizeMode: 'contain',

    // flex: 1,
    // width: undefined,
    // height: undefined,
    // resizeMode: 'contain',

    width: deviceWidth,
    height: deviceWidth,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-evenly',
    paddingBottom: 10,
    paddingLeft: 10,
    gap: 10,
    alignItems: 'center',
  },
  titleRow: {
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
  },
});

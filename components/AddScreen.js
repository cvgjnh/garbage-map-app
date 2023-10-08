import {
  StyleSheet,
  View,
  Alert,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Checkbox,
  Divider,
  Appbar,
  ProgressBar,
  Surface,
} from 'react-native-paper';
import React, { useState, useEffect, useContext } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import _debounce from 'lodash/debounce';
import * as Location from 'expo-location';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as geofirestore from 'geofirestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { ScrollView } from 'react-native-gesture-handler';
import { SelectLocationModal } from './SelectLocationModal';
import { UserContext } from '../UserContext';

const deviceWidth = Dimensions.get('window').width;

export function AddScreen(props) {
  const [title, setTitle] = useState(
    props.selectedMarker ? props.selectedMarker.title : ''
  );
  const [description, setDescription] = useState(
    props.selectedMarker ? props.selectedMarker.description : ''
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [position, setPosition] = useState(
    props.selectedMarker
      ? {
          latitude: props.selectedMarker.coordinates.latitude,
          longitude: props.selectedMarker.coordinates.longitude,
          latitudeDelta: 0.0421,
          longitudeDelta: 0.0421,
        }
      : null
  );
  const [isTrash, setIsTrash] = useState(
    props.selectedMarker ? props.selectedMarker.isTrash : false
  );
  const [isRefundables, setIsRefundables] = useState(
    props.selectedMarker ? props.selectedMarker.isRefundables : false
  );
  const [isCompost, setIsCompost] = useState(
    props.selectedMarker ? props.selectedMarker.isCompost : false
  );
  const [isRecyclables, setIsRecyclables] = useState(
    props.selectedMarker ? props.selectedMarker.isRecyclables : false
  );
  const [missing, setMissing] = useState([]);
  const [chooseOneWarning, setChooseOneWarning] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [currentLocationButtonPressed, setCurrentLocationButtonPressed] =
    useState(false);
  const [imageUpdated, setImageUpdated] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigation = useNavigation();
  const GeoFirestore = geofirestore.initializeApp(firestore());
  const titleMaxLength = 40;
  const descriptionMaxLength = 200;

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Please enable location permissions in your settings',
        'This feature requires location permissions to function.',
        [
          {
            text: 'Not now',
          },
          {
            text: 'OK',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0421,
      longitudeDelta: 0.0421,
    });
    setCurrentLocationButtonPressed(true);
  };

  // preferable to reduce the quality instead of reducing the max height and width
  // height and width of 750 with quality of 1 is about 420 KB
  // height and width of 1500 with quality of 0.5 is about 240 KB and looks better
  // also briefly experimented with height and width of 2000 but 1500 seems preferable
  // currently on this screen and the marker modal, the image is displayed as a square such that the width is equal to the device width
  // this is for design consistency and the image is cropped when displayed such that parts of the image are never used if it is not originally a square
  // this means that unnecessary data is being stored in the database so it may be preferable to crop the image before uploading
  const selectImage = () => {
    ImagePicker.openPicker({
      width: 1500,
      height: 1500,
      cropping: true,
      compressImageQuality: 0.5,
    })
      .then((_image) => {
        setImage(_image.path);
        setImageUpdated(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 1500,
      height: 1500,
      cropping: true,
      compressImageQuality: 0.5,
    })
      .then((_image) => {
        setImage(_image.path);
        setImageUpdated(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const uploadImage = async () => {
    const uri = image;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    setUploading(true);
    setTransferred(0);
    const task = storage().ref(filename).putFile(uri);
    // set progress state
    task.on('state_changed', (snapshot) => {
      setTransferred(snapshot.bytesTransferred / snapshot.totalBytes);
    });
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    return filename;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsTrash(false);
    setIsRefundables(false);
    setIsCompost(false);
    setIsRecyclables(false);
    setImage(null);
    setMissing([]);
    setChooseOneWarning(false);
    setPosition(null);
    setCurrentLocationButtonPressed(false);
  };

  const handleFormSubmit = _debounce(() => {
    setMissing([]);
    setChooseOneWarning(false);
    // You can perform form submission logic here
    if (!title || !image || !position) {
      if (!title) {
        setMissing((prevMissing) => [...prevMissing, 'title']);
      }
      if (!image) {
        setMissing((prevMissing) => [...prevMissing, 'image']);
      }
      if (!position) {
        setMissing((prevMissing) => [...prevMissing, 'position']);
      }
      return;
    }
    if (!isTrash && !isRefundables && !isCompost && !isRecyclables) {
      setChooseOneWarning(true);
      return;
    }
    if (props.selectedMarker) {
      // if editing a marker and the image was changed, need to delete and upload new image
      if (imageUpdated) {
        storage()
          .ref(props.selectedMarker.image)
          .delete()
          .then(() => {
            console.log('Original image deleted!');
            return uploadImage();
          })
          .then((filename) => {
            console.log('new image uploaded');
            return GeoFirestore.collection('markers')
              .doc(props.selectedMarker.id)
              .update({
                title,
                description,
                isTrash,
                isRefundables,
                isCompost,
                isRecyclables,
                image: filename,
              });
          })
          .then(() => {
            Alert.alert(
              'Marker Updated!',
              '',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.pop(),
                },
              ],
              { onDismiss: () => navigation.pop() }
            );
          })
          .catch((error) => {
            console.log(error);
          });

        // if editing a marker and the image was not changed, just update the marker
      } else {
        GeoFirestore.collection('markers')
          .doc(props.selectedMarker.id)
          .update({
            title,
            description,
            isTrash,
            isRefundables,
            isCompost,
            isRecyclables,
          })
          .then(() => {
            Alert.alert(
              'Marker Updated!',
              '',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.pop(),
                },
              ],
              { onDismiss: () => navigation.pop() }
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // if adding a marker, upload the image and then add the marker
    } else {
      uploadImage()
        .then((filename) => {
          const timeCreated = firestore.Timestamp.fromDate(new Date());
          return GeoFirestore.collection('markers').add({
            title,
            description,
            coordinates: new firestore.GeoPoint(
              position.latitude,
              position.longitude
            ),
            userId: user.uid,
            username: user.username,
            isTrash,
            isRefundables,
            isCompost,
            isRecyclables,
            image: filename,
            createdAt: timeCreated,
            lastSeen: timeCreated,
          });
        })
        .then((docRef) => {
          return docRef.get();
        })
        .then((documentSnapshot) => {
          return firestore()
            .collection('logs')
            .add({
              markerId: documentSnapshot.id,
              body: 'Marker added!',
              createdAt: firestore.Timestamp.fromDate(new Date()),
              found: true,
              username: user.username,
              userId: user.uid,
            });
        })
        .then(() => {
          setUser({
            ...user,
            numCreatedLogs: user.numCreatedLogs + 1,
            numCreatedMarkers: user.numCreatedMarkers + 1,
          });
          Alert.alert(
            'Marker added!',
            '',
            [{ text: 'OK', onPress: () => navigation.pop() }],
            { onDismiss: () => navigation.pop() }
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, 1000);

  useEffect(() => {
    if (props.selectedMarker) {
      storage()
        .ref(props.selectedMarker.image)
        .getDownloadURL()
        .then((url) => {
          setImage(url);
        })
        .catch((error) => {
          console.log('Error getting image URL: ', error);
        });
    }
  }, []);

  if (user) {
    return (
      // form to add a marker
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Surface style={styles.container}>
          <SelectLocationModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            position={position}
            setPosition={setPosition}
          />
          <Appbar.Header>
            <Appbar.BackAction
              onPress={() => {
                navigation.pop();
              }}
            />
            <Appbar.Content
              title={props.selectedMarker ? 'Update Marker' : 'Add Marker'}
              titleStyle={styles.title}
            />
          </Appbar.Header>
          <Divider />
          <View style={styles.imageSelectText}>
            <Text variant="titleMedium">Choose an image</Text>
            {image && <Icon name="check" size={20} color="green" />}
          </View>
          <View style={styles.imageSelectBar}>
            <Button onPress={selectImage} icon="image-area" mode="outlined">
              Open Gallery
            </Button>
            <Button onPress={takePhoto} icon="camera" mode="outlined">
              Open Camera
            </Button>
          </View>

          {image !== null ? (
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageBox}
            />
          ) : null}

          <Text variant="titleMedium" style={styles.text}>
            Write a descriptive title
          </Text>
          <TextInput
            style={styles.input}
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            maxLength={titleMaxLength}
          />

          <Text style={styles.textLimit}>
            {title.length}/{titleMaxLength}
          </Text>
          <Text variant="titleMedium" style={styles.text}>
            (Optional) Write a description
          </Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={descriptionMaxLength}
          />
          <Text style={styles.textLimit}>
            {description.length}/{descriptionMaxLength}
          </Text>
          <Text variant="titleMedium" style={styles.text}>
            Select all the garbage categories that apply
          </Text>
          <View style={styles.garbageCategoriesContainer}>
            <View style={styles.garbageCategory}>
              <View style={styles.garbageCategoryText}>
                <Text variant="labelLarge">Trash </Text>
                <Icon name="trash-can" size={16} color="gray" />
              </View>
              <Checkbox
                disabled={false}
                value={isTrash}
                status={isTrash ? 'checked' : 'unchecked'}
                onPress={() => {
                  setIsTrash(!isTrash);
                }}
              />
            </View>
            <View style={styles.garbageCategory}>
              <View style={styles.garbageCategoryText}>
                <Text variant="labelLarge">Refundables </Text>
                <Icon name="bottle-soda" size={16} color="darkblue" />
              </View>
              <Checkbox
                disabled={false}
                value={isRefundables}
                status={isRefundables ? 'checked' : 'unchecked'}
                onPress={() => {
                  setIsRefundables(!isRefundables);
                }}
              />
            </View>
            <View style={styles.garbageCategory}>
              <View style={styles.garbageCategoryText}>
                <Text variant="labelLarge">Recyclables </Text>
                <Icon name="recycle" size={16} color="#5592b4" />
              </View>
              <Checkbox
                disabled={false}
                value={isRecyclables}
                status={isRecyclables ? 'checked' : 'unchecked'}
                onPress={() => {
                  setIsRecyclables(!isRecyclables);
                }}
              />
            </View>
            <View style={styles.garbageCategory}>
              <View style={styles.garbageCategoryText}>
                <Text variant="labelLarge">Compost </Text>
                <Icon name="leaf" size={16} color="green" />
              </View>
              <Checkbox
                disabled={false}
                value={isCompost}
                status={isCompost ? 'checked' : 'unchecked'}
                onPress={() => {
                  setIsCompost(!isCompost);
                }}
              />
            </View>
          </View>

          <View style={styles.imageSelectText}>
            <Text variant="titleMedium">Choose a location</Text>
            {position && <Icon name="check" size={20} color="green" />}
          </View>
          <View style={styles.imageSelectBar}>
            <Button
              onPress={() => {
                setModalVisible(true);
                setCurrentLocationButtonPressed(false);
              }}
              mode="outlined"
              icon="map-outline"
              disabled={!!props.selectedMarker}
            >
              Open Map
            </Button>
            <Button
              onPress={() => {
                useCurrentLocation();
              }}
              mode={currentLocationButtonPressed ? 'contained' : 'outlined'}
              icon="crosshairs-gps"
              disabled={!!props.selectedMarker}
            >
              Use Current Location
            </Button>
          </View>

          {missing.length > 0 && (
            <Text style={styles.warning} variant="labelLarge">
              Missing Fields: {missing.join(', ')}
            </Text>
          )}
          {chooseOneWarning && (
            <Text style={styles.warning} variant="labelLarge">
              Please select at least one garbage category
            </Text>
          )}
          <Divider />
          {uploading && (
            <View>
              <ProgressBar progress={transferred} style={styles.progressBar} />
            </View>
          )}
          <View style={styles.submitBar}>
            <Button
              onPress={() => resetForm()}
              disabled={!!props.selectedMarker}
            >
              Reset Form
            </Button>
            <Button
              onPress={handleFormSubmit}
              mode="contained"
              disabled={uploading}
            >
              Submit
            </Button>
          </View>
        </Surface>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  imageBox: {
    width: deviceWidth,
    height: deviceWidth,
    // alignSelf: 'center',
    marginBottom: 10,
  },
  input: {
    marginLeft: 20,
    marginRight: 20,
  },
  textLimit: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },
  progressBar: {
    marginBottom: 10,
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
  },

  imageSelectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
  },

  submitBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  imageSelectText: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
  },
  text: {
    marginLeft: 20,
  },
  title: {
    alignItems: 'center',
    fontSize: 25,
  },
  garbageCategoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginLeft: 20,
    // marginRight: 20,
    margin: 10,
  },
  garbageCategory: {
    alignItems: 'center',
  },
  garbageCategoryText: {
    flexDirection: 'row',
  },
  warning: {
    color: 'red',
    marginLeft: 20,
  },
  submitText: {
    fontSize: 20,
  },
});

import { StyleSheet, View, Pressable } from 'react-native';
import React from 'react';
import { Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function MarkerPreview(props) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return (
    <Pressable
      style={styles.infoBox}
      onPress={() => {
        props.setModalVisible(true);
      }}
    >
      <Surface style={styles.surface}>
        <View>
          <Text variant="titleLarge">{props.selectedMarker.title}</Text>
        </View>
        <View style={styles.row}>
          {props.selectedMarker.isTrash && (
            <Icon name="trash-can" size={24} color="gray" />
          )}
          {props.selectedMarker.isRefundables && (
            <Icon name="bottle-soda" size={24} color="darkblue" />
          )}
          {props.selectedMarker.isRecyclables && (
            <Icon name="recycle" size={24} color="#5592b4" />
          )}
          {props.selectedMarker.isCompost && (
            <Icon name="leaf" size={24} color="green" />
          )}
        </View>

        <Text variant="bodyMedium">
          Last seen:{' '}
          {props.selectedMarker.lastSeen
            .toDate()
            .toLocaleDateString(undefined, options)}{' '}
        </Text>
      </Surface>
    </Pressable>
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
    borderRadius: 10,
    zIndex: 100,
    position: 'absolute',
  },
  surface: {
    padding: 10,
    borderRadius: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  imageBox: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});

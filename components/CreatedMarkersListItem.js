import { StyleSheet, View } from 'react-native';
import { Text, IconButton, Menu, Divider } from 'react-native-paper';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export function CreatedMarkersListItem(props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return (
    <View>
      <Divider />
      <View style={styles.container}>
        <View>
          <Text variant="titleMedium">{props.marker.title}</Text>
          <Text variant="bodyMedium">
            Created{' '}
            {props.marker.createdAt
              .toDate()
              .toLocaleDateString(undefined, options)}{' '}
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
          }}
          anchor={
            <IconButton
              onPress={() => {
                setMenuVisible(true);
                props.setSelectedMarker(props.marker);
              }}
              icon="dots-vertical"
            />
          }
        >
          <Menu.Item
            onPress={() => {
              props.setModalVisible(true);
              setMenuVisible(false);
            }}
            title="View"
          />
          <Menu.Item
            onPress={() => {
              navigation.navigate('Update');
              setMenuVisible(false);
            }}
            title="Edit"
          />
          <Menu.Item
            onPress={() => {
              props.setDeleteDialogVisible(true);
              setMenuVisible(false);
            }}
            title="Delete"
          />
        </Menu>
      </View>
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  contextMenu: {
    position: 'absolute',
    right: 0,
  },
});

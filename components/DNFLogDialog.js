import React, { useState } from 'react';
import { View } from 'react-native';
import Dialog from "react-native-dialog";
import firestore from '@react-native-firebase/firestore';



export function DNFLogDialog(props) {
    const [textEntry, setTextEntry] = useState('')
  
    const handleSubmit = () => {
    
      firestore()
        .collection('logs')
        .add({
          markerId: props.selectedMarker.id,
          body: textEntry,
          createdAt: firestore.Timestamp.fromDate(new Date()),
          found: false,
          username: props.user.username,
        })
        .then(() => {
          console.log('Log added!');
          props.setDNFLogOpen(false);
        }
      );
    
    }
    return (
      <View>
        <Dialog.Container visible = {props.DNFLogOpen}>
          <Dialog.Title>(Optional) Write a log entry!</Dialog.Title>
          <Dialog.Input
            onChangeText={setTextEntry}
            value={textEntry}
            multiline={true}
            numberOfLines={8}
            textAlignVertical='top'
            maxLength={500}
          />
          <Dialog.Button label="Cancel" onPress={() => props.setDNFLogOpen(false)}/>
          <Dialog.Button label="Submit" onPress={() => handleSubmit()}/>
        </Dialog.Container>
      </View>
    )
  }
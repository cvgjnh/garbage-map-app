import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



export function LogEntry(props) {
    return (
      <View style={styles.container}>
        <Text>{props.log.createdAt.toDate().toString()}</Text>
        <Text>{props.log.found.toString()}</Text>
        <Text>{props.log.username}</Text>
        <Text>{props.log.body}</Text>
      </View>
    )
  }



const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        // left: 10,
        // right: 10,
        padding: 10,
        borderRadius: 10,

    }
    
});

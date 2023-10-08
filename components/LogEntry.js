import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Divider } from 'react-native-paper';

export function LogEntry(props) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return (
    <>
      <Divider />
      <View style={styles.container}>
        <Avatar.Text size={40} label={props.log.username.charAt(0)} />
        <View>
          <Text variant="titleMedium">{props.log.username}</Text>
          <View style={styles.row}>
            {props.log.found ? (
              <Text style={styles.found} variant="titleSmall">
                Found{' '}
              </Text>
            ) : (
              <Text style={styles.DNF} variant="titleSmall">
                DNF{' '}
              </Text>
            )}

            <Text variant="titleSmall">
              on{' '}
              {props.log.createdAt
                .toDate()
                .toLocaleDateString(undefined, options)}{' '}
            </Text>
          </View>

          <Text variant="bodyMedium">{props.log.body}</Text>
        </View>
      </View>
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
  },
  found: {
    color: 'green',
  },
  DNF: {
    color: 'red',
  },
});

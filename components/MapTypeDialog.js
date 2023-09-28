import React, { useState, useEffect } from 'react'
import { Stylesheet, View } from 'react-native'
import {
    Text,
    Modal,
    Dialog,
    Portal,
    RadioButton,
    Button,
} from 'react-native-paper'

export function MapTypeDialog(props) {
    return (
        <Portal>
            <Dialog
                visible={props.dialogVisible}
                onDismiss={() => {
                    props.setDialogVisible(!props.dialogVisible)
                }}
                style={{ zIndex: 1001 }}
            >
                <Dialog.Title>Map Type</Dialog.Title>
                <Dialog.Content>
                    <RadioButton.Group
                        onValueChange={(value) => props.setMapType(value)}
                        value={props.mapType}
                    >
                        <View>
                            <RadioButton.Item label="Hybrid" value="hybrid" />
                            <RadioButton.Item
                                label="Satellite"
                                value="satellite"
                            />
                            <RadioButton.Item
                                label="Standard"
                                value="standard"
                            />

                            <RadioButton.Item label="Terrain" value="terrain" />
                        </View>
                    </RadioButton.Group>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={() =>
                            props.setDialogVisible(!props.dialogVisible)
                        }
                    >
                        Done
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

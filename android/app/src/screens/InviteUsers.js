import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const InviteUser = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const fetchEmails = async (input) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://172.20.10.2:3001/api/users?email=${input}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok && Array.isArray(data)) {
                setSuggestions(data.map(user => user.email));
            } else {
                console.error('Không thể lấy danh sách người dùng:', data.message);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        }
    };

    const handleEmailChange = (input) => {
        setEmail(input);
        if (typingTimeout) clearTimeout(typingTimeout);

        if (input) {
            const timeoutId = setTimeout(() => fetchEmails(input), 500);
            setTypingTimeout(timeoutId);
        } else {
            setSuggestions([]);
        }
    };

    const selectEmail = (selectedEmail) => {
        setEmail(selectedEmail);
        setSuggestions([]);
    };

    const getUserIdByEmail = async (email) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://172.20.10.2:3001/api/users?email=${email}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok && data.length > 0) {
                return data[0]._id;
            } else {
                throw new Error('Không tìm thấy người dùng với email này');
            }
        } catch (error) {
            console.error('Lỗi khi lấy userId:', error);
            throw error;
        }
    };

    const inviteUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const storedProjectId = await AsyncStorage.getItem('selectedProjectId');
            const userId = await getUserIdByEmail(email);
            const response = await fetch(`http://172.20.10.2:3001/api/projects/${storedProjectId}/members`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds: [userId] }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Thành công', 'Mời thành viên thành công');
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', data.message || 'Không thể mời thành viên');
            }
        } catch (error) {
            console.error('Lỗi khi mời thành viên:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi mời thành viên');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} />
                </TouchableOpacity>
                <Text style={styles.title}>Thêm Thành Viên vào Dự Án</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="ellipsis-v" size={30} />
                </TouchableOpacity>
            </View>
            <Text style={styles.label}>Email:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Nhập email người dùng"
            />
            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => selectEmail(item)}>
                            <Text style={styles.suggestion}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.suggestionList}
                />
            )}
            <Button title="Mời" onPress={inviteUser} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        flex: 7,
        fontSize: 20,
        textAlign: 'center',
    },
    iconButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
    },
    suggestionList: {
        maxHeight: 150,
        marginVertical: 8,
    },
    suggestion: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});

export default InviteUser;

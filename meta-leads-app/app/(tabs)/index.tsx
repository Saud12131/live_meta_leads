import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import io, { Socket } from "socket.io-client";

interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  created_time: string;
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000";
    const socket: Socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Connected to server");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
    });

    socket.on("new_lead", (lead: Lead) => {
      console.log("🔥 New lead:", lead);
      
      if (lead && lead.name) {
        setLeads((prev) => [lead, ...prev]);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  const renderItem = ({ item }: { item: Lead }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name || 'Unknown'}</Text>
      <Text>{item.email || 'No email'}</Text>
      <Text>{item.phone || 'No phone'}</Text>
      <Text style={styles.time}>{item.created_time || 'No time'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📥 Live Leads</Text>

      <FlatList
        data={leads}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No leads yet...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  empty: {
    marginTop: 50,
    textAlign: "center",
    color: "gray",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
});
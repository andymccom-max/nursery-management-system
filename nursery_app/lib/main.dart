import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const NurseryApp());
}

class NurseryApp extends StatelessWidget {
  const NurseryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: ChildrenScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class ChildrenScreen extends StatefulWidget {
  const ChildrenScreen({super.key});

  @override
  State<ChildrenScreen> createState() => _ChildrenScreenState();
}

class _ChildrenScreenState extends State<ChildrenScreen> {
  List children = [];

  @override
  void initState() {
    super.initState();
    loadChildren();
  }

  Future<void> loadChildren() async {
    try {
      final response = await http.get(
        Uri.parse('http://192.168.0.236:4000/children'),
      );

      if (response.statusCode == 200) {
        setState(() {
          children = jsonDecode(response.body);
        });
      }
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nursery Children'),
      ),
      body: children.isEmpty
          ? const Center(
              child: Text('No children loaded'),
            )
          : ListView.builder(
              itemCount: children.length,
              itemBuilder: (context, index) {
                final child = children[index];

                return ListTile(
                  title: Text(child['name']),
                  subtitle: Text('Room: ${child['room']}'),
                );
              },
            ),
    );
  }
}
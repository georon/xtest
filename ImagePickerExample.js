import * as React from "react";
import { Button, Image, View, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
//import RNFS from "react-native-fs";

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
    imageContent: null,
  };

  render() {
    let { image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Button title="Pick an image" onPress={this._pickImage} />
        <Button title="Upload to server" onPress={this._uploadImage} />
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
      </View>
    );
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Platform.OS !== "web") {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }
  };

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri });
        this.setState({ imageContent: result.base64 });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  _uploadImage = async () => {
    let imageuri = this.state.image;
    let imageContent = this.state.imageContent;
    alert("Attempting upload: " + imageuri);

    var https = XMLHttpRequest;
    //var FormData = require("form-data");

    if (imageuri != null) {
      var options = {
        method: "POST",
        hostname: "api.myserver.xyz",
        path: "/imgupload/idcard",
        headers: {},
        maxRedirects: 20,
      };

      var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          console.log(body.toString());
          alert("Uploaded: " + body.toString());
        });

        res.on("error", function (error) {
          console.error(error);
        });
      });

      var postData =
        '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: "image/jpeg"\r\n\r\n' +
        imageContent +
        "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

      req.setHeader(
        "content-type",
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
      );

      req.write(postData);

      req.end();
    } else {
      alert("No picture");
      console.log("No picture");
    }
  };
}

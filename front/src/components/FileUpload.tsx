import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

const CHUNK_SIZE = 5 * 1024 * 1024;

interface Chunk {
  data: Uint8Array;
  index: number;
}

interface UploadProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentChunk: number;
}

interface State {
  file: File | null;
  uploadProgress: UploadProgress | null;
  connection: signalR.HubConnection | null;
  chunks: Chunk[];
}


const FileUpload: React.FC = () => {
  const [state, setState] = useState<State>({
    file: null,
    uploadProgress: null,
    connection: null,
    chunks: [],
  });

  useEffect(() => {
    // Connect to the .NET Core SignalR server
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7003/filehub")
      .build();

    newConnection.on("UploadFailed", (failedChunkIndex: number) => {
      // Handle failed chunk upload
      console.error(`Failed to upload chunk ${failedChunkIndex}`);
    });

    newConnection.on("UploadComplete", () => {
      console.log("File upload complete!");
    });

    newConnection.on(
      "ChunkUploaded",
      (chunkData: Uint8Array, chunkIndex: number) => {
        setState((prevState) => ({
          ...prevState,
          chunks: [...prevState.chunks, { data: chunkData, index: chunkIndex }],
        }));
      }
    );

    newConnection.on("ChunkRetrieved", (chunkData: Uint8Array) => {
      // Play the retrieved chunk
      playChunk(chunkData);
    });

    newConnection.on("ChunkRetrievalFailed", (chunkIndex: number) => {
      console.error(`Failed to retrieve chunk ${chunkIndex}`);
    });

    newConnection
      .start()
      .catch((error) =>
        console.error("Error connecting to SignalR server:", error)
      );

    setState((prevState) => ({
      ...prevState,
      connection: newConnection,
    }));

    return () => {
      // Disconnect from the SignalR server when the component unmounts
      newConnection.stop();
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setState((prevState) => ({
      ...prevState,
      file: selectedFile,
    }));
  };

  const uploadFile = async () => {
    const { file, connection } = state;
    if (!file || !connection) return;

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await connection.invoke("UploadChunk", await chunk.arrayBuffer(), i);

        uploadedChunks++;
        setState((prevState) => ({
          ...prevState,
          uploadProgress: {
            total: file.size,
            loaded: uploadedChunks * CHUNK_SIZE,
            percentage: (uploadedChunks / totalChunks) * 100,
            currentChunk: i,
          },
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const playChunk = (chunkData: Uint8Array) => {
    const blob = new Blob([chunkData], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    const videoElement = document.createElement("video");
    videoElement.src = url;
    videoElement.play();
  };

  const playStoredChunk = (chunk: Chunk) => {
    state.connection?.invoke("GetChunk", chunk.index);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
      {state.uploadProgress && (
        <div>
          Upload Progress: {state.uploadProgress.percentage.toFixed(2)}% (Chunk{" "}
          {state.uploadProgress.currentChunk + 1}/
          {Math.ceil((state.file?.size ?? 0) / CHUNK_SIZE || 0)})
        </div>
      )}
      {state.chunks.map((chunk) => (
        <button key={chunk.index} onClick={() => playStoredChunk(chunk)}>
          Play Chunk {chunk.index}
        </button>
      ))}
    </div>
  );
};

export default FileUpload;

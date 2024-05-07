using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


app.MapGet("/hc", () =>
{
    return "Hello";
})
.WithName("hc")
.WithOpenApi();


app.UseRouting();

// app.MapControllers();
app.MapHub<FileUploadHub>("/filehub");


app.Run();



public class FileUploadHub : Hub
{
    private static ConcurrentDictionary<string, MemoryStream> fileChunks = new ConcurrentDictionary<string, MemoryStream>();
    private static ConcurrentDictionary<string, int> failedChunks = new ConcurrentDictionary<string, int>();

    public async Task UploadChunk(byte[] chunk, int index)
    {
        var connectionId = Context.ConnectionId;
        var key = $"{connectionId}_{index}";

        try
        {
            if (!fileChunks.ContainsKey(key))
            {
                fileChunks[key] = new MemoryStream();
            }

            await fileChunks[key].WriteAsync(chunk, 0, chunk.Length);
            await Clients.Caller.SendAsync("ChunkUploaded", chunk, index);
            await CheckAndAssembleFile(connectionId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving chunk at index {index}: {ex.Message}");
            failedChunks[key] = index;
            await Clients.Caller.SendAsync("UploadFailed", index);
        }
    }

    private async Task CheckAndAssembleFile(string connectionId)
    {
        var totalChunks = fileChunks.Count / 2;
        if (fileChunks.Count == totalChunks * 2)
        {
            var fileData = new byte[totalChunks * 5 * 1024 * 1024];
            for (int i = 0; i < totalChunks; i++)
            {
                var key = $"{connectionId}_{i}";
                await fileChunks[key].ReadAsync(fileData, i * 5 * 1024 * 1024, (int)fileChunks[key].Length);
            }

            var filePath = Path.Combine("uploads", $"{connectionId}.mp4");
            await File.WriteAllBytesAsync(filePath, fileData);
            Console.WriteLine($"File saved: {filePath}");
            await Clients.Caller.SendAsync("UploadComplete");
        }
    }

    public async Task GetChunk(int index)
    {
        var connectionId = Context.ConnectionId;
        var key = $"{connectionId}_{index}";

        if (fileChunks.ContainsKey(key))
        {
            var chunk = fileChunks[key].ToArray();
            await Clients.Caller.SendAsync("ChunkRetrieved", chunk);
        }
        else
        {
            await Clients.Caller.SendAsync("ChunkRetrievalFailed", index);
        }
    }
}
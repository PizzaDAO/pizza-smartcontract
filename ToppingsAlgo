## Simulated list of 4 adjacency matrices of nodes in multiples of 8 available on PizzaDAO Discord
library(igraph)
library(ggplot2)
library(psych)     
library(NetworkToolbox)

data <- read.csv(file.choose(),header=T)
View(data)
row.names(data) <-data[,1]
data <-data[,-1]
diag(data) <- 0
View(data)

DM1 <- as.matrix(data)

View(DM1)

G1 <- graph.adjacency(DM1, mode = "undirected", weighted = NULL, diag = TRUE)
G1
plot(G1)

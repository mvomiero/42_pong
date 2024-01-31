#!/bin/bash

# Loop to run the command 10 times
for ((i=1; i<=10; i++)); do
    echo "Running make test_tour - Iteration $i"
    make test_tour
done
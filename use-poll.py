#!/bin/env python3

from pytezos import pytezos

client = pytezos.using(key = 'edsk4LzAuuQF1FkFHV5qXmpL8a5YNtJh1pTtkAYjAVBKCSAbp6LCCD', shell = 'http://florence.newby.org:8732')

contract = client.contract('KT1B5uCAmStQazfTxrvk4jNDoaTFVyYKEc3h')

contract.createPoll({ "poll_id": "my_poll_id_2", "poll_metadata": { "end_date": 1625660357, "num_options": 4 } }).inject()

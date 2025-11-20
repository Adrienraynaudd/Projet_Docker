package fr.digicrafters.simple.rest.app.api;

import fr.digicrafters.simple.rest.app.domain.Item;
import fr.digicrafters.simple.rest.app.domain.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/items")
public class ItemController {
    private static final Logger log = LoggerFactory.getLogger(ItemController.class);

    private final ItemRepository repo;

    public ItemController(ItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Item> findAll() {
        log.info("Finding all items");
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Item> create(@RequestBody Item item) {
        log.info("Creating item {}", item);
        return ResponseEntity.ok(repo.save(item));
    }
}

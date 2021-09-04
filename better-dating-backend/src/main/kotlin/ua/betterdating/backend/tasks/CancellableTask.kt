package ua.betterdating.backend.tasks

import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.DisposableBean

open class CancellableTask: DisposableBean {
    private var currentJob: Job? = null

    override fun destroy() {
        runBlocking {
            currentJob?.cancelAndJoin()
        }
    }

    fun runTask(task: suspend () -> Unit) {
        runBlocking { // https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html
            currentJob = launch {
                task()
            }
            currentJob?.join()
            currentJob = null
        }
    }
}
